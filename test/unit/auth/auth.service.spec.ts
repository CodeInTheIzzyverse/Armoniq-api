import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	ConflictException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../../../src/services/auth.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { TokenService } from '../../../src/services/token.service';
import { AuthTokenRepository } from '../../../src/repositories/auth-token.repository';
import {
	AuthTokenType,
	LoginAttemptReason,
	UserRole,
} from '../../../src/enums';
import { AUTH_MESSAGES } from '../../../src/constants/auth-messages';
import { UserModel } from '../../../src/models/user.model';
import { JwtTokenService } from '../../../src/services/jwt.service';
import { LoginAttemptRepository } from '../../../src/repositories/login-attempt.repository';
import { RefreshTokenRepository } from '../../../src/repositories/refresh-token.repository';
import { hashPassword } from '../../../src/utils/password';

describe('AuthService', () => {
	let service: AuthService;
	let userRepository: UserRepository;
	let tokenService: TokenService;
	let authTokenRepository: AuthTokenRepository;
	let eventEmitter: EventEmitter2;
	let jwtTokenService: JwtTokenService;
	let loginAttemptRepository: LoginAttemptRepository;
	let refreshTokenRepository: RefreshTokenRepository;

	const mockUser: UserModel = {
		id: '507f1f77bcf86cd799439011',
		email: 'test@example.com',
		firstName: 'John',
		lastName: 'Doe',
		passwordHash: 'hashedPassword',
		role: UserRole.CLIENT,
		isActive: true,
		isEmailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserRepository,
					useValue: {
						create: vi.fn(),
						findByEmail: vi.fn(),
						findById: vi.fn(),
						updateEmailVerification: vi.fn(),
					},
				},
				{
					provide: TokenService,
					useValue: {
						createEmailVerificationToken: vi.fn(),
						verifyToken: vi.fn(),
						markTokenAsUsed: vi.fn(),
					},
				},
				{
					provide: JwtTokenService,
					useValue: {
						generateTokens: vi.fn(),
						verifyRefreshToken: vi.fn(),
					},
				},
				{
					provide: AuthTokenRepository,
					useValue: {
						findByTokenHashAndType: vi.fn(),
					},
				},
				{
					provide: EventEmitter2,
					useValue: {
						emit: vi.fn(),
					},
				},
				{
					provide: LoginAttemptRepository,
					useValue: {
						create: vi.fn(),
					},
				},
				{
					provide: RefreshTokenRepository,
					useValue: {
						create: vi.fn(),
						findByUserId: vi.fn(),
						revoke: vi.fn(),
						revokeAllByUserId: vi.fn(),
					},
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		userRepository = module.get<UserRepository>(UserRepository);
		tokenService = module.get<TokenService>(TokenService);
		authTokenRepository =
			module.get<AuthTokenRepository>(AuthTokenRepository);
		eventEmitter = module.get<EventEmitter2>(EventEmitter2);
		jwtTokenService = module.get<JwtTokenService>(JwtTokenService);
		loginAttemptRepository = module.get<LoginAttemptRepository>(
			LoginAttemptRepository,
		);
		refreshTokenRepository = module.get<RefreshTokenRepository>(
			RefreshTokenRepository,
		);
	});

	describe('login', () => {
		const context = { ip: '127.0.0.1', userAgent: 'vitest' };
		const loginDto = {
			email: 'TEST@example.com',
			password: 'Password123!',
		};

		it('authenticates verified users and persists only the refresh hash', async () => {
			const passwordHash = await hashPassword(loginDto.password);
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
				...mockUser,
				passwordHash,
				isEmailVerified: true,
			});
			vi.spyOn(tokenService, 'verifyToken');
			const generateTokensSpy = vi
				.spyOn(jwtTokenService, 'generateTokens')
				.mockResolvedValue({
					accessToken: 'access-token',
					refreshToken: 'refresh-token',
					accessTokenExpiresIn: 900,
					refreshTokenExpiresIn: 2592000,
				});
			const createRefreshToken = vi.spyOn(
				refreshTokenRepository,
				'create',
			);
			const createLoginAttempt = vi.spyOn(
				loginAttemptRepository,
				'create',
			);

			const result = await service.login(loginDto, context);

			expect(result.response.email).toBe(mockUser.email);
			expect(result.accessToken).toBe('access-token');
			expect(generateTokensSpy).toHaveBeenCalledWith(mockUser.id);
			expect(createRefreshToken).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: mockUser.id,
					ip: context.ip,
					userAgent: context.userAgent,
				}),
			);
			const refreshToken = createRefreshToken.mock.calls[0][0].tokenHash;
			expect(refreshToken).not.toBe('refresh-token');
			expect(createLoginAttempt).toHaveBeenCalledWith(
				expect.objectContaining({
					reason: LoginAttemptReason.SUCCESS,
					success: true,
				}),
			);
		});

		it('records invalid credentials without revealing whether the user exists', async () => {
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
			const createLoginAttempt = vi.spyOn(
				loginAttemptRepository,
				'create',
			);

			await expect(service.login(loginDto, context)).rejects.toThrow(
				AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS,
			);
			expect(createLoginAttempt).toHaveBeenCalledWith(
				expect.objectContaining({
					reason: LoginAttemptReason.USER_NOT_FOUND,
					success: false,
				}),
			);
		});

		it('records an incorrect password', async () => {
			const passwordHash = await hashPassword('DifferentPass123!');
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
				...mockUser,
				passwordHash,
				isEmailVerified: true,
			});
			const createLoginAttempt = vi.spyOn(
				loginAttemptRepository,
				'create',
			);

			await expect(service.login(loginDto, context)).rejects.toThrow(
				AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS,
			);
			expect(createLoginAttempt).toHaveBeenCalledWith(
				expect.objectContaining({
					reason: LoginAttemptReason.INVALID_CREDENTIALS,
				}),
			);
		});

		it('does not expose login-attempt persistence failures', async () => {
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
			vi.spyOn(loginAttemptRepository, 'create').mockRejectedValue(
				new Error('database unavailable'),
			);

			await expect(service.login(loginDto, context)).rejects.toThrow(
				AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS,
			);
		});

		it('rejects disabled and unverified accounts with tracked reasons', async () => {
			const createLoginAttempt = vi.spyOn(
				loginAttemptRepository,
				'create',
			);
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
				...mockUser,
				isActive: false,
			});
			await expect(service.login(loginDto, context)).rejects.toThrow(
				AUTH_MESSAGES.LOGIN.ACCOUNT_DISABLED,
			);

			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
			const passwordHash = await hashPassword(loginDto.password);
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
				...mockUser,
				passwordHash,
			});
			await expect(service.login(loginDto, context)).rejects.toThrow(
				AUTH_MESSAGES.LOGIN.ACCOUNT_NOT_VERIFIED,
			);

			expect(createLoginAttempt).toHaveBeenCalledWith(
				expect.objectContaining({
					reason: LoginAttemptReason.EMAIL_NOT_VERIFIED,
					success: false,
				}),
			);
		});
	});

	describe('refresh', () => {
		const context = { ip: '127.0.0.1', userAgent: 'vitest' };
		const rawRefreshToken = 'refresh-token';

		it('rotates a valid refresh token and revokes its predecessor', async () => {
			const tokenHash = await hashPassword(rawRefreshToken);
			vi.spyOn(jwtTokenService, 'verifyRefreshToken').mockReturnValue({
				sub: mockUser.id,
				email: mockUser.email,
				role: mockUser.role,
			});
			vi.spyOn(userRepository, 'findById').mockResolvedValue({
				...mockUser,
				isEmailVerified: true,
			});
			vi.spyOn(refreshTokenRepository, 'findByUserId').mockResolvedValue([
				{
					id: 'old-token-id',
					userId: mockUser.id,
					tokenHash,
					expiresAt: new Date(Date.now() + 60_000),
				},
			]);
			vi.spyOn(jwtTokenService, 'generateTokens').mockResolvedValue({
				accessToken: 'new-access-token',
				refreshToken: 'new-refresh-token',
				accessTokenExpiresIn: 900,
				refreshTokenExpiresIn: 2_592_000,
			});
			const createSpy = vi
				.spyOn(refreshTokenRepository, 'create')
				.mockResolvedValue({
					id: 'new-token-id',
					userId: mockUser.id,
					tokenHash: 'new-hash',
					expiresAt: new Date(Date.now() + 60_000),
				});
			const revokeSpy = vi.spyOn(refreshTokenRepository, 'revoke');

			const result = await service.refresh(rawRefreshToken, context);

			expect(result.refreshToken).toBe('new-refresh-token');
			expect(createSpy).toHaveBeenCalledWith(
				expect.objectContaining({ userId: mockUser.id }),
			);
			expect(revokeSpy).toHaveBeenCalledWith(
				'old-token-id',
				'new-token-id',
			);
		});

		it('revokes all sessions when a refresh token is invalid or reused', async () => {
			vi.spyOn(jwtTokenService, 'verifyRefreshToken').mockReturnValue({
				sub: mockUser.id,
				email: mockUser.email,
				role: mockUser.role,
			});
			vi.spyOn(refreshTokenRepository, 'findByUserId').mockResolvedValue(
				[],
			);
			const revokeAllSpy = vi.spyOn(
				refreshTokenRepository,
				'revokeAllByUserId',
			);

			await expect(
				service.refresh(rawRefreshToken, context),
			).rejects.toThrow(AUTH_MESSAGES.TOKEN.INVALID);
			expect(revokeAllSpy).toHaveBeenCalledWith(mockUser.id);
		});

		it('revokes a valid refresh token during logout', async () => {
			const tokenHash = await hashPassword(rawRefreshToken);
			vi.spyOn(jwtTokenService, 'verifyRefreshToken').mockReturnValue({
				sub: mockUser.id,
				email: mockUser.email,
				role: mockUser.role,
			});
			vi.spyOn(refreshTokenRepository, 'findByUserId').mockResolvedValue([
				{
					id: 'token-id',
					userId: mockUser.id,
					tokenHash,
					expiresAt: new Date(Date.now() + 60_000),
				},
			]);
			const revokeSpy = vi.spyOn(refreshTokenRepository, 'revoke');

			expect(await service.logout(rawRefreshToken)).toBe(
				AUTH_MESSAGES.LOGOUT.SUCCESS,
			);
			expect(revokeSpy).toHaveBeenCalledWith('token-id');
		});
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('register', () => {
		const registerDto = {
			email: 'test@example.com',
			password: 'Password123!',
			firstName: 'John',
			lastName: 'Doe',
		};

		it('should register a new user successfully', async () => {
			const findByEmailSpy = vi
				.spyOn(userRepository, 'findByEmail')
				.mockResolvedValue(null);
			const createSpy = vi
				.spyOn(userRepository, 'create')
				.mockResolvedValue(mockUser);
			const createTokenSpy = vi
				.spyOn(tokenService, 'createEmailVerificationToken')
				.mockResolvedValue({
					token: 'verification-token',
					tokenHash: 'hashed-token',
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				});
			const emitSpy = vi.spyOn(eventEmitter, 'emit');

			const result = await service.register(registerDto);

			expect(result).toBeDefined();
			expect(result.email).toBe(mockUser.email);
			expect(result.message).toBe(AUTH_MESSAGES.REGISTRATION.SUCCESS);
			expect(findByEmailSpy).toHaveBeenCalledWith(registerDto.email);
			expect(createSpy).toHaveBeenCalled();
			expect(createTokenSpy).toHaveBeenCalledWith(mockUser.id);
			expect(emitSpy).toHaveBeenCalledWith(
				'user.registered',
				expect.any(Object),
			);
		});

		it('should throw ConflictException if email already exists', async () => {
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);

			await expect(service.register(registerDto)).rejects.toThrow(
				ConflictException,
			);
			await expect(service.register(registerDto)).rejects.toThrow(
				AUTH_MESSAGES.REGISTRATION.EMAIL_ALREADY_EXISTS,
			);
		});

		it('should normalize the email and never accept a client role', async () => {
			const findByEmailSpy = vi
				.spyOn(userRepository, 'findByEmail')
				.mockResolvedValue(null);
			const createSpy = vi
				.spyOn(userRepository, 'create')
				.mockResolvedValue(mockUser);
			vi.spyOn(
				tokenService,
				'createEmailVerificationToken',
			).mockResolvedValue({
				token: 'verification-token',
				tokenHash: 'hashed-token',
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			});

			await service.register({
				...registerDto,
				email: 'TEST@example.com',
			});

			expect(findByEmailSpy).toHaveBeenCalledWith('test@example.com');
			expect(createSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'test@example.com',
					role: UserRole.CLIENT,
				}),
			);
		});

		it('should translate a concurrent duplicate email into ConflictException', async () => {
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
			vi.spyOn(userRepository, 'create').mockRejectedValue({
				code: 11000,
				keyPattern: { email: 1 },
			});

			await expect(service.register(registerDto)).rejects.toThrow(
				AUTH_MESSAGES.REGISTRATION.EMAIL_ALREADY_EXISTS,
			);
		});
	});

	describe('verifyEmail', () => {
		const token = 'verification-token';
		const userId = '507f1f77bcf86cd799439011';

		it('should verify email successfully', async () => {
			const mockAuthToken = {
				id: 'token-id',
				userId,
				tokenHash: 'hashed-token',
				type: AuthTokenType.EMAIL_VERIFICATION,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				usedAt: undefined,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const findByIdSpy = vi
				.spyOn(userRepository, 'findById')
				.mockResolvedValue(mockUser);
			const findTokenSpy = vi
				.spyOn(authTokenRepository, 'findByTokenHashAndType')
				.mockResolvedValue(mockAuthToken);
			const verifyTokenSpy = vi
				.spyOn(tokenService, 'verifyToken')
				.mockResolvedValue(true);
			const updateSpy = vi
				.spyOn(userRepository, 'updateEmailVerification')
				.mockResolvedValue({
					...mockUser,
					isEmailVerified: true,
				});
			const markUsedSpy = vi
				.spyOn(tokenService, 'markTokenAsUsed')
				.mockResolvedValue();

			const result = await service.verifyEmail(token, userId);

			expect(result).toBe(AUTH_MESSAGES.EMAIL_VERIFICATION.SUCCESS);
			expect(findByIdSpy).toHaveBeenCalledWith(userId);
			expect(findTokenSpy).toHaveBeenCalledWith(
				token,
				AuthTokenType.EMAIL_VERIFICATION,
			);
			expect(verifyTokenSpy).toHaveBeenCalledWith(
				token,
				mockAuthToken.tokenHash,
			);
			expect(updateSpy).toHaveBeenCalledWith(userId, true);
			expect(markUsedSpy).toHaveBeenCalledWith('token-id');
		});

		it('should throw NotFoundException if user not found', async () => {
			vi.spyOn(userRepository, 'findById').mockResolvedValue(null);

			await expect(service.verifyEmail(token, userId)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should throw BadRequestException if email already verified', async () => {
			vi.spyOn(userRepository, 'findById').mockResolvedValue({
				...mockUser,
				isEmailVerified: true,
			});

			await expect(service.verifyEmail(token, userId)).rejects.toThrow(
				BadRequestException,
			);
			await expect(service.verifyEmail(token, userId)).rejects.toThrow(
				AUTH_MESSAGES.EMAIL_VERIFICATION.ALREADY_VERIFIED,
			);
		});

		it('should throw BadRequestException if token is invalid', async () => {
			vi.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
			vi.spyOn(
				authTokenRepository,
				'findByTokenHashAndType',
			).mockResolvedValue(null);

			await expect(service.verifyEmail(token, userId)).rejects.toThrow(
				BadRequestException,
			);
			await expect(service.verifyEmail(token, userId)).rejects.toThrow(
				AUTH_MESSAGES.EMAIL_VERIFICATION.INVALID_TOKEN,
			);
		});

		it('should throw BadRequestException if token is expired', async () => {
			const mockAuthToken = {
				id: 'token-id',
				userId,
				tokenHash: 'hashed-token',
				type: AuthTokenType.EMAIL_VERIFICATION,
				expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired
				usedAt: undefined,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
			vi.spyOn(
				authTokenRepository,
				'findByTokenHashAndType',
			).mockResolvedValue(mockAuthToken);

			await expect(service.verifyEmail(token, userId)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('resendVerificationEmail', () => {
		const email = 'test@example.com';

		it('should resend verification email successfully', async () => {
			const findByEmailSpy = vi
				.spyOn(userRepository, 'findByEmail')
				.mockResolvedValue(mockUser);
			const createTokenSpy = vi
				.spyOn(tokenService, 'createEmailVerificationToken')
				.mockResolvedValue({
					token: 'new-verification-token',
					tokenHash: 'new-hashed-token',
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				});
			const emitSpy = vi.spyOn(eventEmitter, 'emit');

			const result = await service.resendVerificationEmail(email);

			expect(result).toBe(
				AUTH_MESSAGES.EMAIL_VERIFICATION.RESEND_SUCCESS,
			);
			expect(findByEmailSpy).toHaveBeenCalledWith(email);
			expect(createTokenSpy).toHaveBeenCalledWith(mockUser.id);
			expect(emitSpy).toHaveBeenCalledWith(
				'user.registered',
				expect.any(Object),
			);
		});

		it('should return success message even if user not found', async () => {
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

			const result = await service.resendVerificationEmail(email);

			expect(result).toBe(
				AUTH_MESSAGES.EMAIL_VERIFICATION.RESEND_SUCCESS,
			);
		});

		it('should throw BadRequestException if email already verified', async () => {
			vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
				...mockUser,
				isEmailVerified: true,
			});

			await expect(
				service.resendVerificationEmail(email),
			).rejects.toThrow(BadRequestException);
			await expect(
				service.resendVerificationEmail(email),
			).rejects.toThrow(
				AUTH_MESSAGES.EMAIL_VERIFICATION.ALREADY_VERIFIED,
			);
		});
	});
});
