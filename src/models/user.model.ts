import { UserRole } from '../enums';

export interface UserModel {
	id: string;
	role: UserRole;
	firstName: string;
	lastName: string;
	email: string;
	passwordHash: string;
	phone?: string;
	avatar?: string;
	isActive: boolean;
	isEmailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserModel {
	role: UserRole;
	firstName: string;
	lastName: string;
	email: string;
	passwordHash: string;
	phone?: string;
	avatar?: string;
	isActive?: boolean;
	isEmailVerified?: boolean;
}

export interface UpdateUserModel {
	firstName?: string;
	lastName?: string;
	phone?: string;
	avatar?: string;
	isActive?: boolean;
	isEmailVerified?: boolean;
}
