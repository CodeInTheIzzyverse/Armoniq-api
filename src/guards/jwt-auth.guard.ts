import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AUTH_MESSAGES } from '../constants/auth-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest<TUser = unknown>(
		err: unknown,
		user: TUser,
		info: Error,
		context: ExecutionContext,
	): TUser {
		if (err || !user) {
			const request = context.switchToHttp().getRequest<Request>();
			const authHeader = request.headers?.authorization;

			if (!authHeader) {
				throw new Error(AUTH_MESSAGES.TOKEN.MISSING);
			}

			if (info?.name === 'TokenExpiredError') {
				throw new Error(AUTH_MESSAGES.TOKEN.EXPIRED);
			}

			throw new Error(AUTH_MESSAGES.TOKEN.INVALID);
		}

		return user;
	}
}
