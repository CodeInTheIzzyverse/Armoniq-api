import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from '../../database/schemas/user.schema';
import {
	AuthToken,
	AuthTokenSchema,
} from '../../database/schemas/auth-token.schema';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { JwtTokenService } from '../../services/jwt.service';
import { TokenService } from '../../services/token.service';
import { UserRepository } from '../../repositories/user.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { EmailModule } from '../../integrations/email/email.module';
import { UserRegisteredHandler } from '../../events/user-registered.handler';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: AuthToken.name, schema: AuthTokenSchema },
		]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const secret = configService.get<string>(
					'auth.jwtAccessSecret',
				);
				const expiresIn = configService.get<string>(
					'auth.jwtAccessExpiresIn',
				);

				if (!secret) {
					throw new Error('JWT_ACCESS_SECRET is not configured');
				}

				const options = {
					secret,
					signOptions: {
						expiresIn: expiresIn || '15m',
					},
				};

				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return options as any;
			},
		}),
		EmailModule,
	],
	controllers: [AuthController],
	providers: [
		UserRepository,
		AuthTokenRepository,
		AuthService,
		JwtTokenService,
		TokenService,
		JwtStrategy,
		UserRegisteredHandler,
	],
	exports: [AuthService, JwtTokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
