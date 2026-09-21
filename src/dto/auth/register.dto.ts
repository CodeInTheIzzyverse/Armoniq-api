import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class RegisterDto {
	@ApiProperty({
		description: 'User first name',
		example: 'John',
		minLength: 1,
		maxLength: 50,
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(50)
	firstName!: string;

	@ApiProperty({
		description: 'User last name',
		example: 'Doe',
		minLength: 1,
		maxLength: 50,
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(50)
	lastName!: string;

	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		description:
			'User password. Must be at least 8 characters with uppercase, lowercase, number, and special character.',
		example: 'SecurePass123!',
		minLength: 8,
		maxLength: 128,
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(128)
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,128}$/,
		{
			message:
				'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
		},
	)
	password!: string;
}
