import { describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../src/config/app.config';
import { EmailService } from '../../../src/integrations/email/email.service';
import { UserRegisteredHandler } from '../../../src/events/user-registered.handler';
import { PasswordResetRequestedHandler } from '../../../src/events/password-reset-requested.handler';
import { PasswordResetRequestedEvent } from '../../../src/events/password-reset-requested.event';
import { UserRegisteredEvent } from '../../../src/events/user-registered.event';

describe('authentication email handlers', () => {
	const emailService = {
		sendEmailVerificationEmail: vi.fn().mockResolvedValue(undefined),
		sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
	} as unknown as EmailService;
	const configService = {
		get: vi.fn((key: string) =>
			key === 'frontendUrls' ? ['https://armoniq.example'] : 'api',
		),
	} as unknown as ConfigService<AppConfig>;

	it('builds and sends an email verification link through Resend adapter', async () => {
		const handler = new UserRegisteredHandler(emailService, configService);
		const sendVerification = vi.spyOn(
			emailService,
			'sendEmailVerificationEmail',
		);

		await handler.handleUserRegisteredEvent(
			new UserRegisteredEvent(
				'user-id',
				'user@example.com',
				'John',
				'verification-token',
			),
		);

		expect(sendVerification).toHaveBeenCalledWith(
			'user@example.com',
			'John',
			expect.stringContaining('verification-token'),
		);
	});

	it('builds and sends a password reset link through Resend adapter', async () => {
		const handler = new PasswordResetRequestedHandler(
			emailService,
			configService,
		);
		const sendReset = vi.spyOn(emailService, 'sendPasswordResetEmail');

		await handler.handle(
			new PasswordResetRequestedEvent(
				'user-id',
				'user@example.com',
				'John',
				'reset-token',
			),
		);

		expect(sendReset).toHaveBeenCalledWith(
			'user@example.com',
			'John',
			expect.stringContaining('reset-token'),
		);
	});
});
