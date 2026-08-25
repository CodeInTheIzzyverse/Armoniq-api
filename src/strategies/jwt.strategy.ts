import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../config/auth.config';
import { UserRepository } from '../repositories/user.repository';
import { AUTH_MESSAGES } from '../constants/auth-messages';

export interface JwtPayload {
	sub: string;
	email: string;
	role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository,
	) {
		const authConfig = configService.get<AuthConfig>('auth');
		const secret = authConfig?.jwtAccessSecret;

		if (!secret) {
			throw new Error('JWT_ACCESS_SECRET is not configured');
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	async validate(payload: JwtPayload) {
		const user = await this.userRepository.findById(payload.sub);

		if (!user) {
			throw new UnauthorizedException(AUTH_MESSAGES.TOKEN.INVALID);
		}

		if (!user.isActive) {
			throw new UnauthorizedException(AUTH_MESSAGES.GENERAL.UNAUTHORIZED);
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role,
			isEmailVerified: user.isEmailVerified,
		};
	}
}
