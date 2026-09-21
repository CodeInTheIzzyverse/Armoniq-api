import { Module, Type } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
	appConfig,
	authConfig,
	cloudinaryConfig,
	databaseConfig,
	emailConfig,
	googleMapsConfig,
	paymentConfig,
	swaggerConfig,
	validate,
} from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { SerializationInterceptor } from './interceptors/serialization.interceptor';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [
				appConfig,
				authConfig,
				cloudinaryConfig,
				databaseConfig,
				emailConfig,
				googleMapsConfig,
				paymentConfig,
				swaggerConfig,
			],
			validate,
			envFilePath: ['.env', '.env.local'],
		}),
		EventEmitterModule.forRoot(),
		ThrottlerModule.forRoot([
			{
				ttl: 60_000,
				limit: 10,
			},
		]),
		DatabaseModule,
		UsersModule,
		AuthModule,
	],
	controllers: [AppController, HealthController],
	providers: [
		AppService,
		HealthService,
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter as Type,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: SerializationInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
	],
})
export class AppModule {}
