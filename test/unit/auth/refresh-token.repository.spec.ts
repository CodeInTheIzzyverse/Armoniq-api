import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RefreshTokenRepository } from '../../../src/repositories/refresh-token.repository';
import { RefreshToken } from '../../../src/database/schemas/refresh-token.schema';

describe('RefreshTokenRepository', () => {
	it('creates a refresh token with an ObjectId user reference', async () => {
		const create = vi
			.fn<
				(
					document: Record<string, unknown>,
				) => Promise<Record<string, unknown>>
			>()
			.mockImplementation((document) =>
				Promise.resolve({
					...document,
					_id: new Types.ObjectId(),
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			);
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

	it('finds a user refresh-token history and revokes sessions', async () => {
		const token = {
			_id: new Types.ObjectId(),
			userId: new Types.ObjectId(),
			tokenHash: 'argon2-hash',
			expiresAt: new Date(Date.now() + 60_000),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		const find = vi.fn().mockReturnValue({
			lean: () => ({ exec: () => Promise.resolve([token]) }),
		});
		const findByIdAndUpdate = vi.fn().mockReturnValue({
			exec: () => Promise.resolve(),
		});
		const updateMany = vi.fn().mockReturnValue({
			exec: () => Promise.resolve(),
		});
		const module = await Test.createTestingModule({
			providers: [
				RefreshTokenRepository,
				{
					provide: getModelToken(RefreshToken.name),
					useValue: { find, findByIdAndUpdate, updateMany },
				},
			],
		}).compile();
		const repository = module.get<RefreshTokenRepository>(
			RefreshTokenRepository,
		);

		const tokens = await repository.findByUserId(token.userId.toString());
		await repository.revoke(tokens[0].id, '507f1f77bcf86cd799439012');
		await repository.revokeAllByUserId(token.userId.toString());

		expect(tokens[0].tokenHash).toBe('argon2-hash');
		expect(find).toHaveBeenCalled();
		expect(findByIdAndUpdate).toHaveBeenCalled();
		expect(updateMany).toHaveBeenCalled();
	});
});
