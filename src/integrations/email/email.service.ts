import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailConfig } from '../../config/email.config';
import { buildWelcomeEmailTemplate } from './templates';

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);
	private readonly resend: Resend;
	private readonly fromEmail: string;
	private readonly fromName: string;

	constructor(private readonly configService: ConfigService<EmailConfig>) {
		const apiKey = this.configService.get<string>('resendApiKey', {
			infer: true,
		});
		this.fromEmail =
			this.configService.get<string>('mailFrom', { infer: true }) ||
			'noreply@armoniq.com';
		this.fromName =
			this.configService.get<string>('mailFromName', { infer: true }) ||
			'Armoniq';

		if (!apiKey) {
			this.logger.warn(
				'RESEND_API_KEY is not configured. Email sending will be disabled.',
			);
		}

		this.resend = new Resend(apiKey || '');
	}

	async sendWelcomeEmail(
		to: string,
		userName: string,
		verificationUrl: string,
	): Promise<void> {
		const html = buildWelcomeEmailTemplate({
			userName,
			verificationUrl,
		});

		try {
			const result = await this.resend.emails.send({
				from: `${this.fromName} <${this.fromEmail}>`,
				to,
				subject: 'Welcome to Armoniq - Verify Your Email',
				html,
			});

			if (result.error) {
				this.logger.error(
					`Failed to send welcome email to ${to}`,
					result.error,
				);
				throw new Error('Failed to send welcome email');
			}

			this.logger.log(`Welcome email sent successfully to ${to}`);
		} catch (error) {
			this.logger.error(`Failed to send welcome email to ${to}`, error);
			throw new Error('Failed to send welcome email');
		}
	}
}
