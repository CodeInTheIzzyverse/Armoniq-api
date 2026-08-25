import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
	AuthToken,
	AuthTokenDocument,
} from '../database/schemas/auth-token.schema';
import { AuthTokenType } from '../enums';

export interface CreateAuthToken {
	userId: string;
	tokenHash: string;
	type: AuthTokenType;
	expiresAt: Date;
}

export interface AuthTokenModel {
	id: string;
	userId: string;
	tokenHash: string;
	type: AuthTokenType;
	expiresAt: Date;
	usedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

@Injectable()
export class AuthTokenRepository {
	private readonly logger = new Logger(AuthTokenRepository.name);

	constructor(
		@InjectModel(AuthToken.name)
		private readonly authTokenModel: Model<AuthTokenDocument>,
	) {}

	async create(createToken: CreateAuthToken): Promise<AuthTokenModel> {
		const token = new this.authTokenModel({
			...createToken,
			userId: new Types.ObjectId(createToken.userId),
		});
		const savedToken = await token.save();
		return this.mapToModel(savedToken);
	}

	async findByTokenHashAndType(
		tokenHash: string,
		type: AuthTokenType,
	): Promise<AuthTokenModel | null> {
		const token = await this.authTokenModel
			.findOne({ tokenHash, type })
			.lean()
			.exec();
		return token ? this.mapToModel(token as AuthTokenDocument) : null;
	}

	async markAsUsed(id: string): Promise<void> {
		await this.authTokenModel
			.findByIdAndUpdate(id, { usedAt: new Date() })
			.exec();
	}

	async deactivateTokensByUserAndType(
		userId: string,
		type: AuthTokenType,
	): Promise<void> {
		await this.authTokenModel
			.updateMany(
				{
					userId: new Types.ObjectId(userId),
					type,
					usedAt: null,
				},
				{ usedAt: new Date() },
			)
			.exec();
	}

	private mapToModel(token: AuthTokenDocument): AuthTokenModel {
		return {
			id: token._id.toString(),
			userId: token.userId.toString(),
			tokenHash: token.tokenHash,
			type: token.type,
			expiresAt: token.expiresAt,
			usedAt: token.usedAt,
			createdAt: token.createdAt,
			updatedAt: token.updatedAt,
		};
	}
}
