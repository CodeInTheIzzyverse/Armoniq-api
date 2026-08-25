import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import {
	CreateUserModel,
	UpdateUserModel,
	UserModel,
} from '../models/user.model';

@Injectable()
export class UserRepository {
	private readonly logger = new Logger(UserRepository.name);

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
	) {}

	async create(createUser: CreateUserModel): Promise<UserModel> {
		const user = new this.userModel(createUser);
		const savedUser = await user.save();
		return this.mapToModel(savedUser);
	}

	async findByEmail(email: string): Promise<UserModel | null> {
		const user = await this.userModel
			.findOne({ email: email.toLowerCase() })
			.lean()
			.exec();
		return user ? this.mapToModel(user as UserDocument) : null;
	}

	async findById(id: string): Promise<UserModel | null> {
		const user = await this.userModel.findById(id).lean().exec();
		return user ? this.mapToModel(user as UserDocument) : null;
	}

	async update(
		id: string,
		updateUser: UpdateUserModel,
	): Promise<UserModel | null> {
		const user = await this.userModel
			.findByIdAndUpdate(id, updateUser, { new: true })
			.lean()
			.exec();
		return user ? this.mapToModel(user as UserDocument) : null;
	}

	async updateEmailVerification(
		id: string,
		isEmailVerified: boolean,
	): Promise<UserModel | null> {
		return this.update(id, { isEmailVerified });
	}

	async existsByEmail(email: string): Promise<boolean> {
		const count = await this.userModel
			.countDocuments({ email: email.toLowerCase() })
			.exec();
		return count > 0;
	}

	private mapToModel(user: UserDocument): UserModel {
		return {
			id: user._id.toString(),
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			passwordHash: user.passwordHash,
			phone: user.phone,
			avatar: user.avatar,
			isActive: user.isActive,
			isEmailVerified: user.isEmailVerified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
