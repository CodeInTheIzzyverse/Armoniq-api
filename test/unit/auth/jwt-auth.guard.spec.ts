import { ExecutionContext } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard';
import { AUTH_MESSAGES } from '../../../src/constants/auth-messages';

const makeContext = (headers: Record<string, string> = {}) =>
	({
		switchToHttp: () => ({
			getRequest: () => ({ headers }),
		}),
	}) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
	let guard: JwtAuthGuard;

	beforeEach(() => {
		guard = new JwtAuthGuard();
	});

	it('should return the user when authentication succeeds', () => {
		const user = { userId: 'user-1' };
		const result = guard.handleRequest(null, user, null, makeContext());
		expect(result).toBe(user);
	});

	it('should throw MISSING error when no authorization header present and no user', () => {
		expect(() =>
			guard.handleRequest(null, null, null, makeContext()),
		).toThrow(AUTH_MESSAGES.TOKEN.MISSING);
	});

	it('should throw EXPIRED error when token is expired', () => {
		const expiredError = new Error('TokenExpiredError');
		expiredError.name = 'TokenExpiredError';
		expect(() =>
			guard.handleRequest(
				null,
				null,
				expiredError,
				makeContext({ authorization: 'Bearer expired.token.here' }),
			),
		).toThrow(AUTH_MESSAGES.TOKEN.EXPIRED);
	});

	it('should throw INVALID error for other auth failures with a header present', () => {
		const invalidError = new Error('JsonWebTokenError');
		invalidError.name = 'JsonWebTokenError';
		expect(() =>
			guard.handleRequest(
				null,
				null,
				invalidError,
				makeContext({ authorization: 'Bearer invalid.token' }),
			),
		).toThrow(AUTH_MESSAGES.TOKEN.INVALID);
	});

	it('should throw when err is provided even if user exists', () => {
		expect(() =>
			guard.handleRequest(
				new Error('some error'),
				{ userId: 'x' },
				null,
				makeContext(),
			),
		).toThrow();
	});
});
