import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LoginAttemptRepository } from '../../../src/repositories/login-attempt.repository';
import { LoginAttempt } from '../../../src/database/schemas/login-attempt.schema';
import { LoginAttemptReason } from '../../../src/enums';

describe('LoginAttemptRepository', () => {
	it('creates an attempt with an ObjectId user reference', async () => {
		const create = vi
			.fn<(document: Record<string, unknown>) => Promise<void>>()
			.mockResolvedValue(undefined);
		const module = await Test.createTestingModule({
			providers: [
				LoginAttemptRepository,
				{
					provide: getModelToken(LoginAttempt.name),
					useValue: { create },
				},
			],
		}).compile();
		const repository: LoginAttemptRepository =
			module.get<LoginAttemptRepository>(LoginAttemptRepository);

		await repository.create({
			email: 'user@example.com',
			userId: '507f1f77bcf86cd799439011',
			ip: '127.0.0.1',
			userAgent: 'vitest',
			success: false,
			reason: LoginAttemptReason.INVALID_CREDENTIALS,
		});

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'user@example.com',
				reason: LoginAttemptReason.INVALID_CREDENTIALS,
			}),
		);
		expect(create.mock.calls[0]?.[0].userId).toBeInstanceOf(Types.ObjectId);
	});
});
