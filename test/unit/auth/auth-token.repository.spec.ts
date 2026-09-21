import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AuthTokenRepository } from '../../../src/repositories/auth-token.repository';
import { AuthToken } from '../../../src/database/schemas/auth-token.schema';
import { AuthTokenType } from '../../../src/enums';

describe('AuthTokenRepository', () => {
	it('finds active tokens by user and type and marks tokens used', async () => {
		const token = {
			_id: new Types.ObjectId(),
			userId: new Types.ObjectId(),
			tokenHash: 'argon2-hash',
			type: AuthTokenType.PASSWORD_RESET,
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
				AuthTokenRepository,
				{
					provide: getModelToken(AuthToken.name),
					useValue: {
						find,
						findByIdAndUpdate,
						updateMany,
					},
				},
			],
		}).compile();
		const repository = module.get<AuthTokenRepository>(AuthTokenRepository);

		const result = await repository.findByUserIdAndType(
			token.userId.toString(),
			AuthTokenType.PASSWORD_RESET,
		);
		await repository.markAsUsed(result[0].id);
		await repository.deactivateTokensByUserAndType(
			token.userId.toString(),
			AuthTokenType.PASSWORD_RESET,
		);

		expect(result[0].tokenHash).toBe('argon2-hash');
		expect(find).toHaveBeenCalled();
		expect(findByIdAndUpdate).toHaveBeenCalled();
		expect(updateMany).toHaveBeenCalled();
	});
});
