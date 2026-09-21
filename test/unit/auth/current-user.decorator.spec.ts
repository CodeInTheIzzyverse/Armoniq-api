import { ExecutionContext } from '@nestjs/common';
import { describe, it, expect } from 'vitest';

function currentUserFactory(
	field: string | undefined,
	ctx: ExecutionContext,
): unknown {
	const request = ctx
		.switchToHttp()
		.getRequest<{ user?: Record<string, unknown> }>();
	const user = request.user;
	if (!user) return null;
	return field ? user[field] : user;
}

const makeContext = (user?: object) =>
	({
		switchToHttp: () => ({
			getRequest: () => ({ user }),
		}),
	}) as unknown as ExecutionContext;

describe('CurrentUser decorator factory', () => {
	it('should return null when no user on request', () => {
		const result = currentUserFactory(undefined, makeContext(undefined));
		expect(result).toBeNull();
	});

	it('should return the full user payload when no field specified', () => {
		const user = { userId: 'user-1', role: 'CLIENT' };
		const result = currentUserFactory(undefined, makeContext(user));
		expect(result).toEqual(user);
	});

	it('should return a specific field when field is specified', () => {
		const user = { userId: 'user-1', role: 'CLIENT' };
		const result = currentUserFactory('userId', makeContext(user));
		expect(result).toBe('user-1');
	});
});
