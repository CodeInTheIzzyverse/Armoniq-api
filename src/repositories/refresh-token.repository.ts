import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
	RefreshToken,
	RefreshTokenDocument,
} from '../database/schemas/refresh-token.schema';

export interface CreateRefreshToken {
	userId: string;
	tokenHash: string;
	expiresAt: Date;
	userAgent?: string;
	ip?: string;
}

export interface RefreshTokenModel {
	id: string;
	userId: string;
	tokenHash: string;
	expiresAt: Date;
	revokedAt?: Date;
	replacedByTokenId?: string;
	userAgent?: string;
	ip?: string;
}

@Injectable()
export class RefreshTokenRepository {
	constructor(
		@InjectModel(RefreshToken.name)
		private readonly refreshTokenModel: Model<RefreshTokenDocument>,
	) {}

	async create(token: CreateRefreshToken): Promise<RefreshTokenModel> {
		const created = await this.refreshTokenModel.create({
			...token,
			userId: new Types.ObjectId(token.userId),
		});
		return this.mapToModel(created);
	}

	async findByUserId(userId: string): Promise<RefreshTokenModel[]> {
		const tokens = await this.refreshTokenModel
			.find({ userId: new Types.ObjectId(userId) })
			.lean()
			.exec();
		return tokens.map((token) =>
			this.mapToModel(token as RefreshTokenDocument),
		);
	}

	async revoke(id: string, replacedByTokenId?: string): Promise<void> {
		await this.refreshTokenModel
			.findByIdAndUpdate(id, {
				revokedAt: new Date(),
				replacedByTokenId: replacedByTokenId
					? new Types.ObjectId(replacedByTokenId)
					: undefined,
			})
			.exec();
	}

	async revokeAllByUserId(userId: string): Promise<void> {
		await this.refreshTokenModel
			.updateMany(
				{
					userId: new Types.ObjectId(userId),
					revokedAt: { $exists: false },
				},
				{ revokedAt: new Date() },
			)
			.exec();
	}

	private mapToModel(token: RefreshTokenDocument): RefreshTokenModel {
		return {
			id: token._id.toString(),
			userId: token.userId.toString(),
			tokenHash: token.tokenHash,
			expiresAt: token.expiresAt,
			revokedAt: token.revokedAt,
			replacedByTokenId: token.replacedByTokenId?.toString(),
			userAgent: token.userAgent,
			ip: token.ip,
		};
	}
}
