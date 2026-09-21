import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
	@ApiPropertyOptional({ example: 'Jane' })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	firstName?: string;

	@ApiPropertyOptional({ example: 'Doe' })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	lastName?: string;

	@ApiPropertyOptional({ example: '+1234567890' })
	@IsOptional()
	@IsString()
	@Matches(/^\+?[1-9]\d{1,14}$/, {
		message: 'Phone number must be a valid international format',
	})
	phone?: string;

	@ApiPropertyOptional({
		example: 'https://res.cloudinary.com/.../image.jpg',
	})
	@IsOptional()
	@IsUrl()
	avatar?: string;
}
