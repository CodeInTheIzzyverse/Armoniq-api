import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { AuthTokenType } from '../enums';
import { AuthTokenRepository } from '../repositories/auth-token.repository';

export interface CreateTokenResult {
	token: string;
	tokenHash: string;
	expiresAt: Date;
}

@Injectable()
export class TokenService {
	constructor(private readonly authTokenRepository: AuthTokenRepository) {}

	async createEmailVerificationToken(
		userId: string,
	): Promise<CreateTokenResult> {
		const token = crypto.randomBytes(32).toString('hex');
		const tokenHash = await argon2.hash(token);
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await this.authTokenRepository.deactivateTokensByUserAndType(
			userId,
			AuthTokenType.EMAIL_VERIFICATION,
		);

		await this.authTokenRepository.create({
			userId,
			tokenHash,
			type: AuthTokenType.EMAIL_VERIFICATION,
			expiresAt,
		});

		return { token, tokenHash, expiresAt };
	}

	async createPasswordResetToken(userId: string): Promise<CreateTokenResult> {
		const token = crypto.randomBytes(32).toString('hex');
		const tokenHash = await argon2.hash(token);
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

		await this.authTokenRepository.deactivateTokensByUserAndType(
			userId,
			AuthTokenType.PASSWORD_RESET,
		);
		await this.authTokenRepository.create({
			userId,
			tokenHash,
			type: AuthTokenType.PASSWORD_RESET,
			expiresAt,
		});

		return { token, tokenHash, expiresAt };
	}

	async verifyToken(token: string, tokenHash: string): Promise<boolean> {
		try {
			return await argon2.verify(tokenHash, token);
		} catch {
			return false;
		}
	}

	async markTokenAsUsed(tokenId: string): Promise<void> {
		await this.authTokenRepository.markAsUsed(tokenId);
	}

	async findTokenByHashAndType(tokenHash: string, type: AuthTokenType) {
		return this.authTokenRepository.findByTokenHashAndType(tokenHash, type);
	}

	async findValidToken(userId: string, type: AuthTokenType, token: string) {
		const tokens = await this.authTokenRepository.findByUserIdAndType(
			userId,
			type,
		);
		for (const candidate of tokens) {
			if (
				candidate.expiresAt > new Date() &&
				(await this.verifyToken(token, candidate.tokenHash))
			) {
				return candidate;
			}
		}

		return null;
	}
}
