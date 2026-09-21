import {
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
	UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_MESSAGES } from '../constants/auth-messages';
import { AuthTokenType, LoginAttemptReason, UserRole } from '../enums';
import {
	LoginDto,
	LoginResponseDto,
	RegisterDto,
	RegisterResponseDto,
} from '../dto/auth';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { CreateUserModel } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from './token.service';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { LoginAttemptRepository } from '../repositories/login-attempt.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import * as argon2 from 'argon2';
import { JwtTokenService } from './jwt.service';

export interface LoginContext {
	ip: string;
	userAgent: string;
}

export interface LoginResult {
	response: LoginResponseDto;
	accessToken: string;
	refreshToken: string;
}

export interface RefreshContext {
	ip: string;
	userAgent: string;
}

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly userRepository: UserRepository,
		private readonly tokenService: TokenService,
		private readonly jwtTokenService: JwtTokenService,
		private readonly authTokenRepository: AuthTokenRepository,
		private readonly loginAttemptRepository: LoginAttemptRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async login(
		loginDto: LoginDto,
		context: LoginContext,
	): Promise<LoginResult> {
		const email = loginDto.email.toLowerCase();
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			await this.recordLoginAttempt({
				email,
				...context,
				success: false,
				reason: LoginAttemptReason.USER_NOT_FOUND,
			});
			throw new UnauthorizedException(
				AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS,
			);
		}

		if (!user.isActive) {
			await this.recordLoginAttempt({
				email,
				userId: user.id,
				...context,
				success: false,
				reason: LoginAttemptReason.ACCOUNT_DISABLED,
			});
			throw new ForbiddenException(AUTH_MESSAGES.LOGIN.ACCOUNT_DISABLED);
		}

		const passwordMatches = await verifyPassword(
			loginDto.password,
			user.passwordHash,
		);
		if (!passwordMatches) {
			await this.recordLoginAttempt({
				email,
				userId: user.id,
				...context,
				success: false,
				reason: LoginAttemptReason.INVALID_CREDENTIALS,
			});
			throw new UnauthorizedException(
				AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS,
			);
		}

		if (!user.isEmailVerified) {
			await this.recordLoginAttempt({
				email,
				userId: user.id,
				...context,
				success: false,
				reason: LoginAttemptReason.EMAIL_NOT_VERIFIED,
			});
			throw new UnauthorizedException(
				AUTH_MESSAGES.LOGIN.ACCOUNT_NOT_VERIFIED,
			);
		}

		const tokens = await this.jwtTokenService.generateTokens(user.id);
		await this.refreshTokenRepository.create({
			userId: user.id,
			tokenHash: await argon2.hash(tokens.refreshToken),
			expiresAt: new Date(
				Date.now() + tokens.refreshTokenExpiresIn * 1000,
			),
			...context,
		});
		await this.recordLoginAttempt({
			email,
			userId: user.id,
			...context,
			success: true,
			reason: LoginAttemptReason.SUCCESS,
		});

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			response: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				accessTokenExpiresIn: tokens.accessTokenExpiresIn,
				refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
			},
		};
	}

	async refresh(
		refreshToken: string,
		context: RefreshContext,
	): Promise<LoginResult> {
		const payload = this.jwtTokenService.verifyRefreshToken(refreshToken);
		const storedTokens = await this.refreshTokenRepository.findByUserId(
			payload.sub,
		);
		const matchingToken = await this.findRefreshToken(
			storedTokens,
			refreshToken,
		);

		if (
			!matchingToken ||
			matchingToken.revokedAt ||
			matchingToken.expiresAt <= new Date()
		) {
			await this.refreshTokenRepository.revokeAllByUserId(payload.sub);
			throw new UnauthorizedException(AUTH_MESSAGES.TOKEN.INVALID);
		}

		const user = await this.userRepository.findById(payload.sub);
		if (!user || !user.isActive || !user.isEmailVerified) {
			throw new UnauthorizedException(AUTH_MESSAGES.TOKEN.INVALID);
		}

		const tokens = await this.jwtTokenService.generateTokens(user.id);
		const replacement = await this.refreshTokenRepository.create({
			userId: user.id,
			tokenHash: await argon2.hash(tokens.refreshToken),
			expiresAt: new Date(
				Date.now() + tokens.refreshTokenExpiresIn * 1000,
			),
			...context,
		});
		await this.refreshTokenRepository.revoke(
			matchingToken.id,
			replacement.id,
		);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			response: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				accessTokenExpiresIn: tokens.accessTokenExpiresIn,
				refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
			},
		};
	}

	async logout(refreshToken?: string): Promise<string> {
		if (refreshToken) {
			try {
				const payload =
					this.jwtTokenService.verifyRefreshToken(refreshToken);
				const storedTokens =
					await this.refreshTokenRepository.findByUserId(payload.sub);
				const matchingToken = await this.findRefreshToken(
					storedTokens,
					refreshToken,
				);
				if (matchingToken && !matchingToken.revokedAt) {
					await this.refreshTokenRepository.revoke(matchingToken.id);
				}
			} catch {
				this.logger.warn('Logout received an invalid refresh token');
			}
		}

		return AUTH_MESSAGES.LOGOUT.SUCCESS;
	}

	private async findRefreshToken(
		storedTokens: Awaited<
			ReturnType<RefreshTokenRepository['findByUserId']>
		>,
		refreshToken: string,
	) {
		for (const storedToken of storedTokens) {
			if (await argon2.verify(storedToken.tokenHash, refreshToken)) {
				return storedToken;
			}
		}

		return undefined;
	}

	private async recordLoginAttempt(
		attempt: Parameters<LoginAttemptRepository['create']>[0],
	): Promise<void> {
		try {
			await this.loginAttemptRepository.create(attempt);
		} catch (error: unknown) {
			this.logger.error('Failed to record login attempt', error);
		}
	}

	async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
		const { email, password, firstName, lastName } = registerDto;
		const normalizedEmail = email.toLowerCase();

		const existingUser =
			await this.userRepository.findByEmail(normalizedEmail);
		if (existingUser) {
			throw new ConflictException(
				AUTH_MESSAGES.REGISTRATION.EMAIL_ALREADY_EXISTS,
			);
		}

		const passwordHash = await hashPassword(password);

		const createUser: CreateUserModel = {
			email: normalizedEmail,
			passwordHash,
			firstName,
			lastName,
			role: UserRole.CLIENT,
			isActive: true,
			isEmailVerified: false,
		};

		let user: Awaited<ReturnType<UserRepository['create']>>;
		try {
			user = await this.userRepository.create(createUser);
		} catch (error: unknown) {
			if (this.isDuplicateEmailError(error)) {
				throw new ConflictException(
					AUTH_MESSAGES.REGISTRATION.EMAIL_ALREADY_EXISTS,
				);
			}

			throw error;
		}

		const tokenResult =
			await this.tokenService.createEmailVerificationToken(user.id);

		this.eventEmitter.emit(
			'user.registered',
			new UserRegisteredEvent(
				user.id,
				user.email,
				user.firstName,
				tokenResult.token,
			),
		);

		this.logger.log(`User registered successfully: ${user.email}`);

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			isEmailVerified: user.isEmailVerified,
			isActive: user.isActive,
			createdAt: user.createdAt.toISOString(),
			message: AUTH_MESSAGES.REGISTRATION.SUCCESS,
		};
	}

	private isDuplicateEmailError(error: unknown): boolean {
		return (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			error.code === 11000 &&
			'keyPattern' in error &&
			typeof error.keyPattern === 'object' &&
			error.keyPattern !== null &&
			'email' in error.keyPattern
		);
	}

	async verifyEmail(token: string, userId: string): Promise<string> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (user.isEmailVerified) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.ALREADY_VERIFIED,
			);
		}

		const authToken = await this.authTokenRepository.findByTokenHashAndType(
			token,
			AuthTokenType.EMAIL_VERIFICATION,
		);

		if (!authToken) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.INVALID_TOKEN,
			);
		}

		if (authToken.userId !== userId) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.INVALID_TOKEN,
			);
		}

		if (authToken.usedAt) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.INVALID_TOKEN,
			);
		}

		if (authToken.expiresAt < new Date()) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.INVALID_TOKEN,
			);
		}

		const isValid = await this.tokenService.verifyToken(
			token,
			authToken.tokenHash,
		);
		if (!isValid) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.INVALID_TOKEN,
			);
		}

		await this.userRepository.updateEmailVerification(user.id, true);
		await this.tokenService.markTokenAsUsed(authToken.id);

		this.logger.log(`Email verified successfully for user: ${user.email}`);

		return AUTH_MESSAGES.EMAIL_VERIFICATION.SUCCESS;
	}

	async resendVerificationEmail(email: string): Promise<string> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			return AUTH_MESSAGES.EMAIL_VERIFICATION.RESEND_SUCCESS;
		}

		if (user.isEmailVerified) {
			throw new BadRequestException(
				AUTH_MESSAGES.EMAIL_VERIFICATION.ALREADY_VERIFIED,
			);
		}

		const tokenResult =
			await this.tokenService.createEmailVerificationToken(user.id);

		this.eventEmitter.emit(
			'user.registered',
			new UserRegisteredEvent(
				user.id,
				user.email,
				user.firstName,
				tokenResult.token,
			),
		);

		this.logger.log(`Verification email resent to: ${user.email}`);

		return AUTH_MESSAGES.EMAIL_VERIFICATION.RESEND_SUCCESS;
	}
}
