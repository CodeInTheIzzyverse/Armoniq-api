import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../integrations/email/email.service';
import { UserRegisteredEvent } from './user-registered.event';
import { AppConfig } from '../config/app.config';

@Injectable()
export class UserRegisteredHandler {
	private readonly logger = new Logger(UserRegisteredHandler.name);

	constructor(
		private readonly emailService: EmailService,
		private readonly configService: ConfigService<AppConfig>,
	) {}

	@OnEvent('user.registered')
	async handleUserRegisteredEvent(event: UserRegisteredEvent): Promise<void> {
		const { userId, email, firstName, verificationToken } = event;

		const frontendUrl =
			this.configService.get<string>('frontendUrls', {
				infer: true,
			})?.[0] || 'http://localhost:3000';
		const apiPrefix =
			this.configService.get<string>('apiPrefix', { infer: true }) ||
			'api';

		const verificationUrl = `${frontendUrl}/${apiPrefix}/v1/auth/verify-email?token=${verificationToken}&userId=${userId}`;

		try {
			await this.emailService.sendWelcomeEmail(
				email,
				firstName,
				verificationUrl,
			);
			this.logger.log(`Welcome email sent to user ${userId} (${email})`);
		} catch (error) {
			this.logger.error(
				`Failed to send welcome email to user ${userId} (${email})`,
				error,
			);
		}
	}
}
