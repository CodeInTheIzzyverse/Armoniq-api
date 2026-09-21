import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../../../src/utils/password';

describe('password utilities', () => {
	it('hashes passwords without retaining the plaintext', async () => {
		const password = 'SecurePass123!';
		const hash = await hashPassword(password);

		expect(hash).not.toBe(password);
		expect(await verifyPassword(password, hash)).toBe(true);
	});

	it('rejects an incorrect password and malformed hash', async () => {
		const hash = await hashPassword('SecurePass123!');

		expect(await verifyPassword('WrongPass123!', hash)).toBe(false);
		expect(await verifyPassword('SecurePass123!', 'invalid-hash')).toBe(
			false,
		);
	});
});
