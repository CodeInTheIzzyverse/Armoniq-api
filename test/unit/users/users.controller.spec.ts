import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/controllers/users.controller';
import { UsersService } from '../../../src/services/users.service';
import { UserRole } from '../../../src/enums/user-role.enum';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('UsersController', () => {
	let controller: UsersController;

	const mockUserResponse = {
		id: 'user-1',
		role: UserRole.CLIENT,
		firstName: 'John',
		lastName: 'Doe',
		email: 'john@example.com',
		isActive: true,
		isEmailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockUsersService = {
		getProfile: vi.fn(),
		updateProfile: vi.fn(),
		findAll: vi.fn(),
		updateUser: vi.fn(),
		deactivateUser: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);

		vi.clearAllMocks();
	});

	describe('getProfile', () => {
		it('should return user profile', async () => {
			mockUsersService.getProfile.mockResolvedValue(mockUserResponse);
			const result = await controller.getProfile('user-1');
			expect(result).toEqual(mockUserResponse);
		});
	});

	describe('updateProfile', () => {
		it('should update user profile', async () => {
			const updateDto = { firstName: 'Jane' };
			mockUsersService.updateProfile.mockResolvedValue({
				...mockUserResponse,
				firstName: 'Jane',
			});
			const result = await controller.updateProfile('user-1', updateDto);
			expect(result.firstName).toBe('Jane');
		});
	});

	describe('findAll', () => {
		it('should return paginated users', async () => {
			const paginatedResult = {
				data: [mockUserResponse],
				meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
			};
			mockUsersService.findAll.mockResolvedValue(paginatedResult);
			const result = await controller.findAll({ page: 1, limit: 10 });
			expect(result).toEqual(paginatedResult);
		});
	});

	describe('updateUser', () => {
		it('should update user account', async () => {
			const updateDto = { role: UserRole.ADMIN };
			mockUsersService.updateUser.mockResolvedValue({
				...mockUserResponse,
				role: UserRole.ADMIN,
			});
			const result = await controller.updateUser('user-1', updateDto);
			expect(result.role).toBe(UserRole.ADMIN);
		});
	});

	describe('deactivateUser', () => {
		it('should deactivate user', async () => {
			mockUsersService.deactivateUser.mockResolvedValue({
				...mockUserResponse,
				isActive: false,
			});
			const result = await controller.deactivateUser('user-1');
			expect(result.isActive).toBe(false);
		});
	});
});
