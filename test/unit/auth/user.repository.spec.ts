import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRepository } from '../../../src/repositories/user.repository';
import { User } from '../../../src/database/schemas/user.schema';
import { UserRole } from '../../../src/enums';

describe('UserRepository', () => {
	let repository: UserRepository;

	const mockUser = {
		_id: '507f1f77bcf86cd799439011',
		role: UserRole.CLIENT,
		firstName: 'John',
		lastName: 'Doe',
		email: 'test@example.com',
		passwordHash: 'hashedPassword',
		phone: '1234567890',
		avatar: 'avatar.jpg',
		isActive: true,
		isEmailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	// Create a mock class that can be used as constructor
	class MockUserModel {
		static find = vi.fn();
		static findOne = vi.fn();
		static findById = vi.fn();
		static findByIdAndUpdate = vi.fn();
		static countDocuments = vi.fn();

		constructor(public data: any) {}

		save = vi.fn().mockImplementation(() => {
			return Promise.resolve({
				...mockUser,
				...this.data,
			});
		});
	}

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserRepository,
				{
					provide: getModelToken(User.name),
					useValue: MockUserModel,
				},
			],
		}).compile();

		repository = module.get<UserRepository>(UserRepository);
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
	});

	describe('create', () => {
		it('should create a new user', async () => {
			const createUser = {
				email: 'test@example.com',
				passwordHash: 'hashedPassword',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.CLIENT,
			};

			const result = await repository.create(createUser);

			expect(result).toBeDefined();
			expect(result.email).toBe(createUser.email);
			expect(result.firstName).toBe(createUser.firstName);
		});
	});

	describe('findByEmail', () => {
		it('should find a user by email', async () => {
			MockUserModel.findOne.mockReturnValue({
				lean: () => ({
					exec: () => Promise.resolve(mockUser),
				}),
			});

			const result = await repository.findByEmail('test@example.com');

			expect(result).toBeDefined();
			expect(result?.email).toBe(mockUser.email);
		});

		it('should return null if user not found', async () => {
			MockUserModel.findOne.mockReturnValue({
				lean: () => ({
					exec: () => Promise.resolve(null),
				}),
			});

			const result = await repository.findByEmail(
				'nonexistent@example.com',
			);

			expect(result).toBeNull();
		});
	});

	describe('findById', () => {
		it('should find a user by id', async () => {
			MockUserModel.findById.mockReturnValue({
				lean: () => ({
					exec: () => Promise.resolve(mockUser),
				}),
			});

			const result = await repository.findById(
				'507f1f77bcf86cd799439011',
			);

			expect(result).toBeDefined();
			expect(result?.id).toBe('507f1f77bcf86cd799439011');
		});

		it('should return null if user not found', async () => {
			MockUserModel.findById.mockReturnValue({
				lean: () => ({
					exec: () => Promise.resolve(null),
				}),
			});

			const result = await repository.findById('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('update', () => {
		it('should update a user', async () => {
			const updatedUser = { ...mockUser, firstName: 'Jane' };
			MockUserModel.findByIdAndUpdate.mockReturnValue({
				lean: () => ({
					exec: () => Promise.resolve(updatedUser),
				}),
			});

			const result = await repository.update('507f1f77bcf86cd799439011', {
				firstName: 'Jane',
			});

			expect(result).toBeDefined();
			expect(result?.firstName).toBe('Jane');
		});
	});

	describe('updateEmailVerification', () => {
		it('should update email verification status', async () => {
			const updatedUser = { ...mockUser, isEmailVerified: true };
			MockUserModel.findByIdAndUpdate.mockReturnValue({
				lean: () => ({
					exec: () => Promise.resolve(updatedUser),
				}),
			});

			const result = await repository.updateEmailVerification(
				'507f1f77bcf86cd799439011',
				true,
			);

			expect(result).toBeDefined();
			expect(result?.isEmailVerified).toBe(true);
		});
	});

	describe('existsByEmail', () => {
		it('should return true if user exists', async () => {
			MockUserModel.countDocuments.mockReturnValue({
				exec: () => Promise.resolve(1),
			});

			const result = await repository.existsByEmail('test@example.com');

			expect(result).toBe(true);
		});

		it('should return false if user does not exist', async () => {
			MockUserModel.countDocuments.mockReturnValue({
				exec: () => Promise.resolve(0),
			});

			const result = await repository.existsByEmail(
				'nonexistent@example.com',
			);

			expect(result).toBe(false);
		});
	});
});
