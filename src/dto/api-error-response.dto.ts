import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
	@ApiProperty({
		description: 'HTTP status code',
		example: 400,
	})
	statusCode!: number;

	@ApiProperty({
		description: 'Error timestamp in ISO format',
		example: '2024-01-15T10:30:00.000Z',
	})
	timestamp!: string;

	@ApiProperty({
		description: 'Request path',
		example: '/api/v1/auth/login',
	})
	path!: string;

	@ApiProperty({
		description: 'Error type',
		example: 'Bad Request',
		required: false,
	})
	error?: string;

	@ApiProperty({
		description: 'Error message',
		example: 'Invalid credentials',
		required: false,
	})
	message?: string;

	@ApiProperty({
		description: 'Validation errors array',
		example: [
			'email must be an email',
			'password must be longer than 8 characters',
		],
		required: false,
		isArray: true,
	})
	errors?: string[];
}
