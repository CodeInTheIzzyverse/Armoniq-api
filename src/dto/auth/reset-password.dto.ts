import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty({ description: 'User ID associated with the reset token' })
	@IsString()
	@IsNotEmpty()
	userId!: string;

	@ApiProperty({ description: 'Single-use password reset token' })
	@IsString()
	@IsNotEmpty()
	token!: string;

	@ApiProperty({
		description:
			'New password with uppercase, lowercase, number, and special character',
		example: 'NewSecurePass123!',
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
	newPassword!: string;
}
