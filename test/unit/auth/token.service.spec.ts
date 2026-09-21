import { describe, expect, it, vi } from 'vitest';
import { AuthTokenType } from '../../../src/enums';
import { AuthTokenRepository } from '../../../src/repositories/auth-token.repository';
import { TokenService } from '../../../src/services/token.service';

describe('TokenService', () => {
	const authTokenRepository = {
		deactivateTokensByUserAndType: vi.fn().mockResolvedValue(undefined),
		create: vi.fn().mockResolvedValue(undefined),
		markAsUsed: vi.fn().mockResolvedValue(undefined),
		findByTokenHashAndType: vi.fn(),
	};
	const service = new TokenService(
		authTokenRepository as unknown as AuthTokenRepository,
	);

	it('creates a hashed email verification token and deactivates previous tokens', async () => {
		const result = await service.createEmailVerificationToken('user-id');

		expect(result.token).toMatch(/^[a-f0-9]{64}$/);
		expect(result.tokenHash).not.toBe(result.token);
		expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
		expect(
			authTokenRepository.deactivateTokensByUserAndType,
		).toHaveBeenCalledWith('user-id', AuthTokenType.EMAIL_VERIFICATION);
		expect(authTokenRepository.create).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-id',
				tokenHash: result.tokenHash,
				type: AuthTokenType.EMAIL_VERIFICATION,
			}),
		);
	});

	it('verifies a valid token and rejects an invalid hash', async () => {
		const result = await service.createEmailVerificationToken('user-id');

		expect(await service.verifyToken(result.token, result.tokenHash)).toBe(
			true,
		);
		expect(await service.verifyToken('wrong-token', result.tokenHash)).toBe(
			false,
		);
		expect(await service.verifyToken('token', 'not-a-hash')).toBe(false);
	});

	it('delegates token lookup and marking as used', async () => {
		const token = { id: 'token-id' };
		authTokenRepository.findByTokenHashAndType.mockResolvedValue(token);

		expect(
			await service.findTokenByHashAndType(
				'hash',
				AuthTokenType.EMAIL_VERIFICATION,
			),
		).toBe(token);
		await service.markTokenAsUsed('token-id');
		expect(authTokenRepository.markAsUsed).toHaveBeenCalledWith('token-id');
	});
});
