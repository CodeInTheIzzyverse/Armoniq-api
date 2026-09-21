import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
	LoginAttempt,
	LoginAttemptDocument,
} from '../database/schemas/login-attempt.schema';
import { LoginAttemptReason } from '../enums';

export interface CreateLoginAttempt {
	email: string;
	userId?: string;
	ip: string;
	userAgent: string;
	success: boolean;
	reason: LoginAttemptReason;
}

@Injectable()
export class LoginAttemptRepository {
	constructor(
		@InjectModel(LoginAttempt.name)
		private readonly loginAttemptModel: Model<LoginAttemptDocument>,
	) {}

	async create(attempt: CreateLoginAttempt): Promise<void> {
		await this.loginAttemptModel.create({
			...attempt,
			userId: attempt.userId
				? new Types.ObjectId(attempt.userId)
				: undefined,
		});
	}
}
