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

@Injectable()
export class RefreshTokenRepository {
	constructor(
		@InjectModel(RefreshToken.name)
		private readonly refreshTokenModel: Model<RefreshTokenDocument>,
	) {}

	async create(token: CreateRefreshToken): Promise<void> {
		await this.refreshTokenModel.create({
			...token,
			userId: new Types.ObjectId(token.userId),
		});
	}
}
