import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	Req,
	Res,
	UnauthorizedException,
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
	ApiUnauthorizedResponse,
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
import { AUTH_COOKIES } from '../constants/auth-cookies';
import { AUTH_MESSAGES } from '../constants/auth-messages';

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

		this.setTokenCookies(response, result, secure);

		return result.response;
	}

	@Post(API_ROUTES.AUTH.REFRESH)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Rotate refresh token',
		description:
			'Validates the refresh token, revokes it, and issues a new access and refresh token pair.',
	})
	@ApiOkResponse({
		description: 'Tokens refreshed successfully',
		type: LoginResponseDto,
	})
	@ApiUnauthorizedResponse({
		description: 'Invalid, expired, or revoked refresh token',
		type: ApiErrorResponse,
	})
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<LoginResponseDto> {
		const refreshToken = this.extractRefreshToken(request);
		if (typeof refreshToken !== 'string') {
			throw new UnauthorizedException(AUTH_MESSAGES.TOKEN.MISSING);
		}

		const result = await this.authService.refresh(refreshToken, {
			ip: request.ip || 'unknown',
			userAgent: request.get('user-agent') || 'unknown',
		});
		this.setTokenCookies(
			response,
			result,
			this.configService.get<string>('app.nodeEnv') === 'production',
		);

		return result.response;
	}

	@Post(API_ROUTES.AUTH.LOGOUT)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Log out a user',
		description:
			'Revokes the current refresh token and clears auth cookies.',
	})
	@ApiOkResponse({
		description: 'Logout successful',
		type: MessageResponseDto,
	})
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<MessageResponseDto> {
		const message = await this.authService.logout(
			this.extractRefreshToken(request),
		);
		this.clearTokenCookies(
			response,
			this.configService.get<string>('app.nodeEnv') === 'production',
		);

		return { message };
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

	private setTokenCookies(
		response: Response,
		result: {
			accessToken: string;
			refreshToken: string;
			response: LoginResponseDto;
		},
		secure: boolean,
	): void {
		response.cookie(AUTH_COOKIES.ACCESS_TOKEN, result.accessToken, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			maxAge: result.response.accessTokenExpiresIn * 1000,
		});
		response.cookie(AUTH_COOKIES.REFRESH_TOKEN, result.refreshToken, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			maxAge: result.response.refreshTokenExpiresIn * 1000,
		});
	}

	private clearTokenCookies(response: Response, secure: boolean): void {
		const options = { httpOnly: true, secure, sameSite: 'lax' as const };
		response.clearCookie(AUTH_COOKIES.ACCESS_TOKEN, options);
		response.clearCookie(AUTH_COOKIES.REFRESH_TOKEN, options);
	}

	private extractRefreshToken(request: Request): string | undefined {
		const cookies: unknown = request.cookies;
		if (typeof cookies !== 'object' || cookies === null) {
			return undefined;
		}

		const refreshToken = (cookies as Record<string, unknown>)[
			AUTH_COOKIES.REFRESH_TOKEN
		];
		return typeof refreshToken === 'string' ? refreshToken : undefined;
	}
}
