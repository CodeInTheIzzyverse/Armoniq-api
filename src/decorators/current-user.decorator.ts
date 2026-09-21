import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface JwtPayload {
	userId: string;
	[key: string]: unknown;
}

/**
 * Extracts the authenticated user from the request.
 * Usage:
 *   @CurrentUser() user: JwtPayload          → full payload
 *   @CurrentUser('userId') userId: string    → single field
 */
export const CurrentUser = createParamDecorator(
	(field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
		const request = ctx
			.switchToHttp()
			.getRequest<Request & { user?: JwtPayload }>();
		const user = request.user;
		if (!user) return null;
		return field ? user[field] : user;
	},
);
