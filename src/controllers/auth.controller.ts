import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	Req,
	Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
	RegisterDto,
	RegisterResponseDto,
	ResendVerificationDto,
	MessageResponseDto,
	LoginDto,
	LoginResponseDto,
} from '../dto/auth';
import { ApiErrorResponse } from '../dto/api-error-response.dto';
import { API_ROUTES } from '../constants/routes';

@ApiTags('Authentication')
@Controller(API_ROUTES.AUTH.BASE)
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Post(API_ROUTES.AUTH.LOGIN)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Authenticate a user',
		description:
			'Validates credentials and sets secure HTTP-only access and refresh cookies.',
	})
	@ApiOkResponse({
		description: 'User authenticated successfully',
		type: LoginResponseDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid input data',
		type: ApiErrorResponse,
	})
	async login(
		@Body() loginDto: LoginDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<LoginResponseDto> {
		const result = await this.authService.login(loginDto, {
			ip: request.ip || 'unknown',
			userAgent: request.get('user-agent') || 'unknown',
		});
		const secure =
			this.configService.get<string>('app.nodeEnv') === 'production';

		response.cookie('access_token', result.accessToken, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			maxAge: result.response.accessTokenExpiresIn * 1000,
		});
		response.cookie('refresh_token', result.refreshToken, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			maxAge: result.response.refreshTokenExpiresIn * 1000,
		});

		return result.response;
	}

	@Post(API_ROUTES.AUTH.REGISTER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Register a new user',
		description:
			'Creates a new user account and sends a verification email. The user must verify their email before they can log in.',
	})
	@ApiCreatedResponse({
		description: 'User registered successfully',
		type: RegisterResponseDto,
	})
	@ApiConflictResponse({
		description: 'Email already exists',
		type: ApiErrorResponse,
	})
	@ApiBadRequestResponse({
		description: 'Invalid input data',
		type: ApiErrorResponse,
	})
	async register(
		@Body() registerDto: RegisterDto,
	): Promise<RegisterResponseDto> {
		return this.authService.register(registerDto);
	}

	@Post(API_ROUTES.AUTH.VERIFY_EMAIL)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Verify email address',
		description:
			'Verifies the user email address using the token sent via email. After verification, the user can log in.',
	})
	@ApiQuery({
		name: 'token',
		description: 'Email verification token',
		required: true,
		type: String,
	})
	@ApiQuery({
		name: 'userId',
		description: 'User ID',
		required: true,
		type: String,
	})
	@ApiOkResponse({
		description: 'Email verified successfully',
		type: MessageResponseDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid or expired token',
		type: ApiErrorResponse,
	})
	async verifyEmail(
		@Query('token') token: string,
		@Query('userId') userId: string,
	): Promise<MessageResponseDto> {
		const message = await this.authService.verifyEmail(token, userId);
		return { message };
	}

	@Post(API_ROUTES.AUTH.RESEND_VERIFICATION)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Resend verification email',
		description:
			'Resends the email verification link to the user. Use this if the original verification email was not received or has expired.',
	})
	@ApiOkResponse({
		description: 'Verification email resent successfully',
		type: MessageResponseDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request',
		type: ApiErrorResponse,
	})
	async resendVerification(
		@Body() resendDto: ResendVerificationDto,
	): Promise<MessageResponseDto> {
		const message = await this.authService.resendVerificationEmail(
			resendDto.email,
		);
		return { message };
	}
}
