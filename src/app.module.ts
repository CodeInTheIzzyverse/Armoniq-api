import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
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
import { HealthController } from './controllers/health.controller';
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
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
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
