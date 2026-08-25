import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums';

export class RegisterResponseDto {
	@ApiProperty({
		description: 'Unique user identifier',
		example: '507f1f77bcf86cd799439011',
	})
	id!: string;

	@ApiProperty({
		description: 'User first name',
		example: 'John',
	})
	firstName!: string;

	@ApiProperty({
		description: 'User last name',
		example: 'Doe',
	})
	lastName!: string;

	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@example.com',
	})
	email!: string;

	@ApiProperty({
		description: 'User role',
		enum: UserRole,
		example: UserRole.CLIENT,
	})
	role!: UserRole;

	@ApiProperty({
		description: 'Whether the user email is verified',
		example: false,
	})
	isEmailVerified!: boolean;

	@ApiProperty({
		description: 'Whether the user account is active',
		example: true,
	})
	isActive!: boolean;

	@ApiProperty({
		description: 'Account creation timestamp',
		example: '2024-01-15T10:30:00.000Z',
	})
	createdAt!: string;

	@ApiProperty({
		description: 'Message indicating successful registration',
		example:
			'Registration successful. Please check your email to verify your account.',
	})
	message!: string;
}
