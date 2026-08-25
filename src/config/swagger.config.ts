import { registerAs } from '@nestjs/config';

export interface SwaggerConfig {
	title: string;
	description: string;
	version: string;
}

export default registerAs('swagger', () => ({
	title: process.env.SWAGGER_TITLE || 'Armoniq API',
	description:
		process.env.SWAGGER_DESCRIPTION || 'RESTful ecommerce backend API',
	version: process.env.SWAGGER_VERSION || '1.0',
}));
