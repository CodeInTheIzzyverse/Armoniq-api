import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RefreshTokenRepository } from '../../../src/repositories/refresh-token.repository';
import { RefreshToken } from '../../../src/database/schemas/refresh-token.schema';

describe('RefreshTokenRepository', () => {
	it('creates a refresh token with an ObjectId user reference', async () => {
		const create = vi
			.fn<(document: Record<string, unknown>) => Promise<void>>()
			.mockResolvedValue(undefined);
		const module = await Test.createTestingModule({
			providers: [
				RefreshTokenRepository,
				{
					provide: getModelToken(RefreshToken.name),
					useValue: { create },
				},
			],
		}).compile();
		const repository: RefreshTokenRepository =
			module.get<RefreshTokenRepository>(RefreshTokenRepository);

		await repository.create({
			userId: '507f1f77bcf86cd799439011',
			tokenHash: 'argon2-hash',
			expiresAt: new Date(Date.now() + 60_000),
			ip: '127.0.0.1',
			userAgent: 'vitest',
		});

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				tokenHash: 'argon2-hash',
			}),
		);
		expect(create.mock.calls[0]?.[0].userId).toBeInstanceOf(Types.ObjectId);
	});
});
