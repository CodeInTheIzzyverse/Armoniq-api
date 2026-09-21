import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import {
	UpdateProfileDto,
	UpdateUserDto,
	UsersQueryDto,
	UserResponseDto,
} from '../dto/users';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { UserModel } from '../models/user.model';
import { getPaginationOptions } from '../utils/pagination';

@Injectable()
export class UsersService {
	constructor(private readonly userRepository: UserRepository) {}

	async getProfile(userId: string): Promise<UserResponseDto> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.mapToResponseDto(user);
	}

	async updateProfile(
		userId: string,
		updateProfileDto: UpdateProfileDto,
	): Promise<UserResponseDto> {
		const user = await this.userRepository.update(userId, updateProfileDto);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.mapToResponseDto(user);
	}

	async findAll(
		query: UsersQueryDto,
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		const { skip, limit, page } = getPaginationOptions(
			query.page,
			query.limit,
		);

		const { users, total } = await this.userRepository.findAll(skip, limit);

		return {
			data: users.map((u) => this.mapToResponseDto(u)),
			meta: {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
				hasNextPage: page < Math.ceil(total / limit),
				hasPreviousPage: page > 1,
			},
		};
	}

	async updateUser(
		userId: string,
		updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto> {
		const user = await this.userRepository.update(userId, updateUserDto);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.mapToResponseDto(user);
	}

	async deactivateUser(userId: string): Promise<UserResponseDto> {
		const user = await this.userRepository.update(userId, {
			isActive: false,
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.mapToResponseDto(user);
	}

	private mapToResponseDto(user: UserModel): UserResponseDto {
		return {
			id: user.id,
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phone: user.phone,
			avatar: user.avatar,
			isActive: user.isActive,
			isEmailVerified: user.isEmailVerified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
