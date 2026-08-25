import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../config/auth.config';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../enums';
import { AUTH_MESSAGES } from '../constants/auth-messages';

export interface TokenPayload {
	sub: string;
	email: string;
	role: UserRole;
}

export interface JwtTokenResult {
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresIn: number;
	refreshTokenExpiresIn: number;
}

@Injectable()
export class JwtTokenService {
	private readonly accessTokenSecret: string;
	private readonly refreshTokenSecret: string;
	private readonly accessTokenExpiresIn: string;
	private readonly refreshTokenExpiresIn: string;

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository,
	) {
		const authConfig = this.configService.get<AuthConfig>('auth');
		
		this.accessTokenSecret = authConfig?.jwtAccessSecret || '';
		this.refreshTokenSecret = authConfig?.jwtRefreshSecret || '';
		this.accessTokenExpiresIn = authConfig?.jwtAccessExpiresIn || '15m';
		this.refreshTokenExpiresIn = authConfig?.jwtRefreshExpiresIn || '30d';

		if (!this.accessTokenSecret || !this.refreshTokenSecret) {
			throw new Error('JWT secrets are not configured');
		}
	}

	async generateTokens(userId: string): Promise<JwtTokenResult> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new UnauthorizedException(AUTH_MESSAGES.GENERAL.UNAUTHORIZED);
		}

		const payload: TokenPayload = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: this.accessTokenSecret,
			expiresIn: this.accessTokenExpiresIn,
		} as any);

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.refreshTokenSecret,
			expiresIn: this.refreshTokenExpiresIn,
		} as any);

		const accessTokenExpiresIn = this.parseExpiresIn(
			this.accessTokenExpiresIn,
		);
		const refreshTokenExpiresIn = this.parseExpiresIn(
			this.refreshTokenExpiresIn,
		);

		return {
			accessToken,
			refreshToken,
			accessTokenExpiresIn,
			refreshTokenExpiresIn,
		};
	}

	verifyAccessToken(token: string): TokenPayload {
		try {
			return this.jwtService.verify<TokenPayload>(token, {
				secret: this.accessTokenSecret,
			});
		} catch {
			throw new UnauthorizedException(AUTH_MESSAGES.TOKEN.INVALID);
		}
	}

	verifyRefreshToken(token: string): TokenPayload {
		try {
			return this.jwtService.verify<TokenPayload>(token, {
				secret: this.refreshTokenSecret,
			});
		} catch {
			throw new UnauthorizedException(AUTH_MESSAGES.TOKEN.INVALID);
		}
	}

	private parseExpiresIn(expiresIn: string): number {
		const match = expiresIn.match(/^(\d+)([smhd])$/);
		if (!match) return 900;

		const value = parseInt(match[1], 10);
		const unit = match[2];

		switch (unit) {
			case 's':
				return value;
			case 'm':
				return value * 60;
			case 'h':
				return value * 60 * 60;
			case 'd':
				return value * 60 * 60 * 24;
			default:
				return 900;
		}
	}
}
