import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../../src/guards/roles.guard';
import { UserRole } from '../../../src/enums/user-role.enum';
import { AUTH_MESSAGES } from '../../../src/constants/auth-messages';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('RolesGuard', () => {
	let guard: RolesGuard;
	let reflector: Reflector;

	beforeEach(() => {
		reflector = new Reflector();
		guard = new RolesGuard(reflector);
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	it('should return true if no roles are required', () => {
		vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

		const context = {
			getHandler: vi.fn(),
			getClass: vi.fn(),
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({}),
			}),
		} as unknown as ExecutionContext;

		expect(guard.canActivate(context)).toBe(true);
	});

	it('should throw ForbiddenException if user is not in request', () => {
		vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
			UserRole.ADMIN,
		]);

		const context = {
			getHandler: vi.fn(),
			getClass: vi.fn(),
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({}), // No user
			}),
		} as unknown as ExecutionContext;

		expect(() => guard.canActivate(context)).toThrow(
			new ForbiddenException(AUTH_MESSAGES.GENERAL.UNAUTHORIZED),
		);
	});

	it('should throw ForbiddenException if user does not have required role', () => {
		vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
			UserRole.ADMIN,
		]);

		const context = {
			getHandler: vi.fn(),
			getClass: vi.fn(),
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({
					user: { role: UserRole.CLIENT },
				}),
			}),
		} as unknown as ExecutionContext;

		expect(() => guard.canActivate(context)).toThrow(
			new ForbiddenException(AUTH_MESSAGES.GENERAL.FORBIDDEN),
		);
	});

	it('should return true if user has required role', () => {
		vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
			UserRole.ADMIN,
		]);

		const context = {
			getHandler: vi.fn(),
			getClass: vi.fn(),
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({
					user: { role: UserRole.ADMIN },
				}),
			}),
		} as unknown as ExecutionContext;

		expect(guard.canActivate(context)).toBe(true);
	});
});
