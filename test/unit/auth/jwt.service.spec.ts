import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenService } from '../../../src/services/jwt.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { UserRole } from '../../../src/enums';

const user = {
	id: '507f1f77bcf86cd799439011',
	email: 'user@example.com',
	role: UserRole.CLIENT,
};

describe('JwtTokenService', () => {
	const sign = vi.fn().mockReturnValue('signed-token');
	const verify = vi.fn();
	const jwtService = { sign, verify } as unknown as JwtService;
	const configService = {
		get: vi.fn().mockReturnValue({
			jwtAccessSecret: 'access-secret',
			jwtRefreshSecret: 'refresh-secret',
			jwtAccessExpiresIn: '15m',
			jwtRefreshExpiresIn: '30d',
		}),
	} as unknown as ConfigService;
	const findById = vi.fn().mockResolvedValue(user);
	const userRepository = { findById } as unknown as UserRepository;
	const service = new JwtTokenService(
		jwtService,
		configService,
		userRepository,
	);

	it('generates access and refresh tokens with configured expirations', async () => {
		const result = await service.generateTokens(user.id);

		expect(result).toEqual({
			accessToken: 'signed-token',
			refreshToken: 'signed-token',
			accessTokenExpiresIn: 900,
			refreshTokenExpiresIn: 2_592_000,
		});
		expect(sign).toHaveBeenCalledTimes(2);
		expect(findById).toHaveBeenCalledWith(user.id);
	});

	it('rejects token generation for an unknown user', async () => {
		findById.mockResolvedValueOnce(null);

		await expect(service.generateTokens(user.id)).rejects.toThrow(
			UnauthorizedException,
		);
	});

	it('verifies access and refresh tokens', () => {
		verify.mockReturnValue({ sub: user.id });

		expect(service.verifyAccessToken('access-token')).toEqual({
			sub: user.id,
		});
		expect(service.verifyRefreshToken('refresh-token')).toEqual({
			sub: user.id,
		});
		expect(verify).toHaveBeenCalledTimes(2);
	});

	it('rejects invalid access and refresh tokens', () => {
		verify.mockImplementation(() => {
			throw new Error('invalid token');
		});

		expect(() => service.verifyAccessToken('invalid')).toThrow(
			UnauthorizedException,
		);
		expect(() => service.verifyRefreshToken('invalid')).toThrow(
			UnauthorizedException,
		);
	});

	it('supports seconds, hours, and fallback expiration formats', async () => {
		const variableConfig = {
			get: vi.fn().mockReturnValue({
				jwtAccessSecret: 'access-secret',
				jwtRefreshSecret: 'refresh-secret',
				jwtAccessExpiresIn: '10s',
				jwtRefreshExpiresIn: '2h',
			}),
		} as unknown as ConfigService;
		const variableService = new JwtTokenService(
			jwtService,
			variableConfig,
			userRepository,
		);

		expect(await variableService.generateTokens(user.id)).toEqual(
			expect.objectContaining({
				accessTokenExpiresIn: 10,
				refreshTokenExpiresIn: 7200,
			}),
		);

		const fallbackConfig = {
			get: vi.fn().mockReturnValue({
				jwtAccessSecret: 'access-secret',
				jwtRefreshSecret: 'refresh-secret',
				jwtAccessExpiresIn: 'invalid',
				jwtRefreshExpiresIn: 'invalid',
			}),
		} as unknown as ConfigService;
		const fallbackService = new JwtTokenService(
			jwtService,
			fallbackConfig,
			userRepository,
		);
		expect(await fallbackService.generateTokens(user.id)).toEqual(
			expect.objectContaining({
				accessTokenExpiresIn: 900,
				refreshTokenExpiresIn: 900,
			}),
		);
	});

	it('rejects missing JWT secrets during construction', () => {
		const missingSecretConfig = {
			get: vi.fn().mockReturnValue(undefined),
		} as unknown as ConfigService;

		expect(
			() =>
				new JwtTokenService(
					jwtService,
					missingSecretConfig,
					userRepository,
				),
		).toThrow('JWT secrets are not configured');
	});
});
