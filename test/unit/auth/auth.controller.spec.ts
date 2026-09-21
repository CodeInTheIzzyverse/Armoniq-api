import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/auth.service';
import {
	LoginDto,
	ForgotPasswordDto,
	RegisterDto,
	ResendVerificationDto,
	ResetPasswordDto,
} from '../../../src/dto/auth';
import type { Request, Response } from 'express';
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
						login: vi.fn(),
						refresh: vi.fn(),
						logout: vi.fn(),
						forgotPassword: vi.fn(),
						resetPassword: vi.fn(),
						verifyEmail: vi.fn(),
						resendVerificationEmail: vi.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: vi.fn().mockReturnValue('test'),
					},
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	describe('login', () => {
		it('sets HTTP-only access and refresh cookies', async () => {
			const loginDto: LoginDto = {
				email: 'test@example.com',
				password: 'Password123!',
			};
			const cookieSpy = vi.fn();
			const response = { cookie: cookieSpy } as unknown as Response;
			const request = {
				ip: '127.0.0.1',
				get: vi.fn().mockReturnValue('vitest'),
			} as unknown as Request;
			vi.spyOn(authService, 'login').mockResolvedValue({
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
				response: {
					...mockUser,
					accessTokenExpiresIn: 900,
					refreshTokenExpiresIn: 2592000,
				},
			});

			const result = await controller.login(loginDto, request, response);

			expect(result.email).toBe(mockUser.email);
			expect(cookieSpy).toHaveBeenCalledTimes(2);
			expect(cookieSpy).toHaveBeenNthCalledWith(
				1,
				'access_token',
				'access-token',
				expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
			);
			expect(cookieSpy).toHaveBeenNthCalledWith(
				2,
				'refresh_token',
				'refresh-token',
				expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
			);
		});
	});

	describe('refresh', () => {
		it('rotates cookies using the refresh token cookie', async () => {
			const cookieSpy = vi.fn();
			const response = { cookie: cookieSpy } as unknown as Response;
			const request = {
				cookies: { refresh_token: 'refresh-token' },
				ip: '127.0.0.1',
				get: vi.fn().mockReturnValue('vitest'),
			} as unknown as Request;
			const refreshSpy = vi
				.spyOn(authService, 'refresh')
				.mockResolvedValue({
					accessToken: 'new-access-token',
					refreshToken: 'new-refresh-token',
					response: {
						...mockUser,
						accessTokenExpiresIn: 900,
						refreshTokenExpiresIn: 2592000,
					},
				});

			await controller.refresh(request, response);

			expect(cookieSpy).toHaveBeenCalledTimes(2);
			expect(refreshSpy).toHaveBeenCalledWith(
				'refresh-token',
				expect.objectContaining({ ip: '127.0.0.1' }),
			);
		});

		it('rejects a request without a refresh token cookie', async () => {
			const request = { cookies: {} } as unknown as Request;
			const response = { cookie: vi.fn() } as unknown as Response;

			await expect(controller.refresh(request, response)).rejects.toThrow(
				UnauthorizedException,
			);
		});
	});

	describe('logout', () => {
		it('revokes the refresh token and clears authentication cookies', async () => {
			const clearCookieSpy = vi.fn();
			const response = {
				clearCookie: clearCookieSpy,
			} as unknown as Response;
			const request = {
				cookies: { refresh_token: 'refresh-token' },
			} as unknown as Request;
			vi.spyOn(authService, 'logout').mockResolvedValue(
				AUTH_MESSAGES.LOGOUT.SUCCESS,
			);

			const result = await controller.logout(request, response);

			expect(result.message).toBe(AUTH_MESSAGES.LOGOUT.SUCCESS);
			expect(clearCookieSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('password recovery', () => {
		it('returns the forgot-password service response', async () => {
			const dto: ForgotPasswordDto = { email: 'user@example.com' };
			const forgotSpy = vi
				.spyOn(authService, 'forgotPassword')
				.mockResolvedValue(
					AUTH_MESSAGES.PASSWORD_RESET.REQUEST_SUCCESS,
				);

			const result = await controller.forgotPassword(dto);

			expect(result.message).toBe(
				AUTH_MESSAGES.PASSWORD_RESET.REQUEST_SUCCESS,
			);
			expect(forgotSpy).toHaveBeenCalledWith(dto);
		});

		it('returns the reset-password service response', async () => {
			const dto: ResetPasswordDto = {
				userId: '507f1f77bcf86cd799439011',
				token: 'reset-token',
				newPassword: 'NewSecurePass123!',
			};
			vi.spyOn(authService, 'resetPassword').mockResolvedValue(
				AUTH_MESSAGES.PASSWORD_RESET.RESET_SUCCESS,
			);

			const result = await controller.resetPassword(dto);

			expect(result.message).toBe(
				AUTH_MESSAGES.PASSWORD_RESET.RESET_SUCCESS,
			);
		});
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
