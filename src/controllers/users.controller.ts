import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
	UpdateProfileDto,
	UpdateUserDto,
	UsersQueryDto,
	UserResponseDto,
} from '../dto/users';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ApiErrorResponse } from '../dto/api-error-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiResponse({
	status: 401,
	description: 'Unauthorized',
	type: ApiErrorResponse,
})
@ApiResponse({
	status: 403,
	description: 'Forbidden',
	type: ApiErrorResponse,
})
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	@Roles(UserRole.CLIENT, UserRole.ADMIN)
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({
		status: 200,
		description: 'Profile retrieved successfully',
		type: UserResponseDto,
	})
	async getProfile(
		@CurrentUser('userId') userId: string,
	): Promise<UserResponseDto> {
		return this.usersService.getProfile(userId);
	}

	@Patch('me')
	@Roles(UserRole.CLIENT, UserRole.ADMIN)
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiResponse({
		status: 200,
		description: 'Profile updated successfully',
		type: UserResponseDto,
	})
	async updateProfile(
		@CurrentUser('userId') userId: string,
		@Body() updateProfileDto: UpdateProfileDto,
	): Promise<UserResponseDto> {
		return this.usersService.updateProfile(userId, updateProfileDto);
	}

	@Get()
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Get all users (Admin only)' })
	@ApiResponse({
		status: 200,
		description: 'Users retrieved successfully',
		// Swagger doesn't fully support generics in decorators easily, so we skip full type here
	})
	async findAll(
		@Query() query: UsersQueryDto,
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		return this.usersService.findAll(query);
	}

	@Patch(':id')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Update user account (Admin only)' })
	@ApiResponse({
		status: 200,
		description: 'User updated successfully',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
		type: ApiErrorResponse,
	})
	async updateUser(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.usersService.updateUser(id, updateUserDto);
	}

	@Delete(':id')
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Deactivate user account (Admin only)' })
	@ApiResponse({
		status: 200,
		description: 'User deactivated successfully',
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
		type: ApiErrorResponse,
	})
	async deactivateUser(@Param('id') id: string): Promise<UserResponseDto> {
		return this.usersService.deactivateUser(id);
	}
}
