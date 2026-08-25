import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_MESSAGES } from '../constants/auth-messages';
import { UserRole, AuthTokenType } from '../enums';
import { RegisterDto, RegisterResponseDto } from '../dto/auth';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { CreateUserModel } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from './token.service';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { hashPassword } from '../utils/password';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly userRepository: UserRepository,
		private readonly tokenService: TokenService,
		private readonly authTokenRepository: AuthTokenRepository,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
		const { email, password, firstName, lastName, role } = registerDto;

		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new ConflictException(
				AUTH_MESSAGES.REGISTRATION.EMAIL_ALREADY_EXISTS,
			);
		}

		const passwordHash = await hashPassword(password);

		const createUser: CreateUserModel = {
			email: email.toLowerCase(),
			passwordHash,
			firstName,
			lastName,
			role: role || UserRole.CLIENT,
			isActive: true,
			isEmailVerified: false,
		};

		const user = await this.userRepository.create(createUser);

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
