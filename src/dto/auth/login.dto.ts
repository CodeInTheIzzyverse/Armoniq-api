import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		description: 'User password',
		example: 'SecurePass123!',
		maxLength: 128,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(128)
	password!: string;
}
