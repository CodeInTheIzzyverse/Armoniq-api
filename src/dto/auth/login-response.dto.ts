import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums';

export class LoginResponseDto {
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	id!: string;

	@ApiProperty({ example: 'John' })
	firstName!: string;

	@ApiProperty({ example: 'Doe' })
	lastName!: string;

	@ApiProperty({ example: 'john.doe@example.com' })
	email!: string;

	@ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
	role!: UserRole;

	@ApiProperty({ example: 900 })
	accessTokenExpiresIn!: number;

	@ApiProperty({ example: 2592000 })
	refreshTokenExpiresIn!: number;
}
