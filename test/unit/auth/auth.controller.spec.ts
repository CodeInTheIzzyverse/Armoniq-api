import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/auth.service';
import { RegisterDto, ResendVerificationDto } from '../../../src/dto/auth';
import { UserRole } from '../../../src/enums';
import { AUTH_MESSAGES } from '../../../src/constants/auth-messages';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: AuthService;

	const mockUser = {
		id: '507f1f77bcf86cd799439011',
		email: 'test@example.com',
		firstName: 'John',
		lastName: 'Doe',
		role: UserRole.CLIENT,
		isEmailVerified: false,
		isActive: true,
		createdAt: new Date().toISOString(),
		message: AUTH_MESSAGES.REGISTRATION.SUCCESS,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						register: vi.fn(),
						verifyEmail: vi.fn(),
						resendVerificationEmail: vi.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('register', () => {
		it('should register a new user successfully', async () => {
			const registerDto: RegisterDto = {
				email: 'test@example.com',
				password: 'Password123!',
				firstName: 'John',
				lastName: 'Doe',
			};

			const registerSpy = vi
				.spyOn(authService, 'register')
				.mockResolvedValue(mockUser);

			const result = await controller.register(registerDto);

			expect(result).toBeDefined();
			expect(result.email).toBe(mockUser.email);
			expect(result.message).toBe(AUTH_MESSAGES.REGISTRATION.SUCCESS);
			expect(registerSpy).toHaveBeenCalledWith(registerDto);
		});
	});

	describe('verifyEmail', () => {
		it('should verify email successfully', async () => {
			const token = 'verification-token';
			const userId = '507f1f77bcf86cd799439011';

			const verifySpy = vi
				.spyOn(authService, 'verifyEmail')
				.mockResolvedValue(AUTH_MESSAGES.EMAIL_VERIFICATION.SUCCESS);

			const result = await controller.verifyEmail(token, userId);

			expect(result).toBeDefined();
			expect(result.message).toBe(
				AUTH_MESSAGES.EMAIL_VERIFICATION.SUCCESS,
			);
			expect(verifySpy).toHaveBeenCalledWith(token, userId);
		});
	});

	describe('resendVerification', () => {
		it('should resend verification email successfully', async () => {
			const resendDto: ResendVerificationDto = {
				email: 'test@example.com',
			};

			const resendSpy = vi
				.spyOn(authService, 'resendVerificationEmail')
				.mockResolvedValue(
					AUTH_MESSAGES.EMAIL_VERIFICATION.RESEND_SUCCESS,
				);

			const result = await controller.resendVerification(resendDto);

			expect(result).toBeDefined();
			expect(result.message).toBe(
				AUTH_MESSAGES.EMAIL_VERIFICATION.RESEND_SUCCESS,
			);
			expect(resendSpy).toHaveBeenCalledWith(resendDto.email);
		});
	});
});
