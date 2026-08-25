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
import { UserRole, AuthTokenType } from '../../../src/enums';
import { AUTH_MESSAGES } from '../../../src/constants/auth-messages';
import { UserModel } from '../../../src/models/user.model';

describe('AuthService', () => {
	let service: AuthService;
	let userRepository: UserRepository;
	let tokenService: TokenService;
	let authTokenRepository: AuthTokenRepository;
	let eventEmitter: EventEmitter2;

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
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		userRepository = module.get<UserRepository>(UserRepository);
		tokenService = module.get<TokenService>(TokenService);
		authTokenRepository =
			module.get<AuthTokenRepository>(AuthTokenRepository);
		eventEmitter = module.get<EventEmitter2>(EventEmitter2);
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
