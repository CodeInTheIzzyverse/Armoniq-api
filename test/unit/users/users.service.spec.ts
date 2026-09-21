import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../../../src/services/users.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { UserRole } from '../../../src/enums/user-role.enum';
import { UserModel } from '../../../src/models/user.model';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('UsersService', () => {
	let service: UsersService;

	const mockUser: UserModel = {
		id: 'user-1',
		role: UserRole.CLIENT,
		firstName: 'John',
		lastName: 'Doe',
		email: 'john@example.com',
		passwordHash: 'hash',
		isActive: true,
		isEmailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockUserRepository = {
		findById: vi.fn(),
		update: vi.fn(),
		findAll: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: UserRepository,
					useValue: mockUserRepository,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);

		vi.clearAllMocks();
	});

	describe('getProfile', () => {
		it('should return user profile', async () => {
			mockUserRepository.findById.mockResolvedValue(mockUser);
			const result = await service.getProfile('user-1');
			expect(result.id).toBe(mockUser.id);
			expect(result).not.toHaveProperty('passwordHash');
		});

		it('should throw NotFoundException if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);
			await expect(service.getProfile('user-1')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('updateProfile', () => {
		it('should update and return user profile', async () => {
			const updateDto = { firstName: 'Jane' };
			const updatedUser = { ...mockUser, firstName: 'Jane' };
			mockUserRepository.update.mockResolvedValue(updatedUser);

			const result = await service.updateProfile('user-1', updateDto);
			expect(result.firstName).toBe('Jane');
		});
	});

	describe('findAll', () => {
		it('should return paginated users', async () => {
			mockUserRepository.findAll.mockResolvedValue({
				users: [mockUser],
				total: 1,
			});

			const result = await service.findAll({ page: 1, limit: 10 });
			expect(result.data.length).toBe(1);
			expect(result.meta.total).toBe(1);
			expect(result.meta.page).toBe(1);
		});
	});

	describe('updateUser', () => {
		it('should update user role', async () => {
			const updateDto = { role: UserRole.ADMIN };
			const updatedUser = { ...mockUser, role: UserRole.ADMIN };
			mockUserRepository.update.mockResolvedValue(updatedUser);

			const result = await service.updateUser('user-1', updateDto);
			expect(result.role).toBe(UserRole.ADMIN);
		});
	});

	describe('deactivateUser', () => {
		it('should deactivate user', async () => {
			const updatedUser = { ...mockUser, isActive: false };
			mockUserRepository.update.mockResolvedValue(updatedUser);

			const result = await service.deactivateUser('user-1');
			expect(result.isActive).toBe(false);
		});
	});
});
