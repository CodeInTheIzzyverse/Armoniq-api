import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { AppConfig } from '../config/app.config';
import { EmailService } from '../integrations/email/email.service';
import { PasswordResetRequestedEvent } from './password-reset-requested.event';

@Injectable()
export class PasswordResetRequestedHandler {
	private readonly logger = new Logger(PasswordResetRequestedHandler.name);

	constructor(
		private readonly emailService: EmailService,
		private readonly configService: ConfigService<AppConfig>,
	) {}

	@OnEvent('password.reset.requested')
	async handle(event: PasswordResetRequestedEvent): Promise<void> {
		const frontendUrl =
			this.configService.get<string>('frontendUrls', {
				infer: true,
			})?.[0] || 'http://localhost:3000';
		const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(event.resetToken)}&userId=${encodeURIComponent(event.userId)}`;
		try {
			await this.emailService.sendPasswordResetEmail(
				event.email,
				event.firstName,
				resetUrl,
			);
		} catch (error) {
			this.logger.error(
				`Failed to send password reset email to ${event.userId}`,
				error,
			);
		}
	}
}
