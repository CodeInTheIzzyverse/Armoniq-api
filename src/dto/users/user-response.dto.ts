import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums/user-role.enum';

export class UserResponseDto {
	@ApiProperty({ example: '60d0fe4f5311236168a109ca' })
	id!: string;

	@ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
	role!: UserRole;

	@ApiProperty({ example: 'John' })
	firstName!: string;

	@ApiProperty({ example: 'Doe' })
	lastName!: string;

	@ApiProperty({ example: 'john.doe@example.com' })
	email!: string;

	@ApiProperty({ example: '+1234567890', required: false })
	phone?: string;

	@ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
	avatar?: string;

	@ApiProperty({ example: true })
	isActive!: boolean;

	@ApiProperty({ example: true })
	isEmailVerified!: boolean;

	@ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
	createdAt!: Date;

	@ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
	updatedAt!: Date;
}
