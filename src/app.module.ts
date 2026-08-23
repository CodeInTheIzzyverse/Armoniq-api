import { Module } from '@nestjs/common';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
