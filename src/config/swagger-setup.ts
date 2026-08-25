import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(
	app: INestApplication,
	configService: ConfigService,
): void {
	const swaggerTitle =
		configService.get<string>('swagger.title') || 'Armoniq API';
	const swaggerDescription =
		configService.get<string>('swagger.description') ||
		'RESTful ecommerce backend API';
	const swaggerVersion =
		configService.get<string>('swagger.version') || '1.0';

	const config = new DocumentBuilder()
		.setTitle(swaggerTitle)
		.setDescription(swaggerDescription)
		.setVersion(swaggerVersion)
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'Authorization',
				description: 'Enter JWT token',
				in: 'header',
			},
			'JWT-auth',
		)
		.addCookieAuth('refresh_token', {
			type: 'apiKey',
			in: 'cookie',
			name: 'refresh_token',
			description: 'JWT refresh token stored in HTTP-only cookie',
		})
		.addTag(
			'Authentication',
			'User authentication and authorization endpoints',
		)
		.addTag('Users', 'User management endpoints')
		.addTag('Products', 'Product catalog endpoints')
		.addTag('Categories', 'Category and subcategory endpoints')
		.addTag('Cart', 'Shopping cart endpoints')
		.addTag('Orders', 'Order management endpoints')
		.addTag('Reviews', 'Product review endpoints')
		.addTag('Favorites', 'User favorites endpoints')
		.addTag('Addresses', 'User address management endpoints')
		.addTag('Payments', 'Payment processing endpoints')
		.addTag('Banners', 'Promotional banner endpoints')
		.addTag('Slides', 'Homepage slide endpoints')
		.addTag('Blog', 'Blog post endpoints')
		.addTag('Settings', 'Store settings and branding endpoints')
		.addTag('Dashboard', 'Dashboard statistics endpoints')
		.addTag('Health', 'Health check endpoints')
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			methodKey,
	});

	SwaggerModule.setup('docs', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
			tagsSorter: 'alpha',
			operationsSorter: 'alpha',
		},
		customSiteTitle: `${swaggerTitle} - Documentation`,
		customfavIcon: '/favicon.ico',
	});
}
