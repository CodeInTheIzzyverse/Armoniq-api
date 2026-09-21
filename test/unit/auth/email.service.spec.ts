import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../../../src/config/email.config';
import { EmailService } from '../../../src/integrations/email/email.service';
import { buildEmailVerificationTemplate } from '../../../src/integrations/email/templates/email-verification.template';
import { buildPasswordResetTemplate } from '../../../src/integrations/email/templates/password-reset.template';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('resend', () => ({
	Resend: class {
		emails = { send };
	},
}));

describe('EmailService and templates', () => {
	let service: EmailService;

	beforeEach(() => {
		send.mockReset();
		send.mockResolvedValue({ data: { id: 'email-id' }, error: null });
		service = new EmailService({
			get: vi.fn((key: string) => {
				if (key === 'resendApiKey') return 'resend-key';
				if (key === 'mailFrom') return 'noreply@example.com';
				if (key === 'mailFromName') return 'Armoniq';
				return undefined;
			}),
		} as unknown as ConfigService<EmailConfig>);
	});

	it('sends verification and password-reset templates through Resend', async () => {
		await service.sendEmailVerificationEmail(
			'user@example.com',
			'John',
			'https://example.com/verify',
		);
		await service.sendPasswordResetEmail(
			'user@example.com',
			'John',
			'https://example.com/reset',
		);

		expect(send).toHaveBeenCalledTimes(2);
		expect(send).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ subject: 'Verify your Armoniq email' }),
		);
		expect(send).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ subject: 'Reset your Armoniq password' }),
		);
	});

	it('throws when Resend returns an error', async () => {
		send.mockResolvedValueOnce({ error: { message: 'provider failure' } });

		await expect(
			service.sendPasswordResetEmail(
				'user@example.com',
				'John',
				'https://example.com/reset',
			),
		).rejects.toThrow('Failed to send email');
	});

	it('renders the token URLs in both templates', () => {
		expect(
			buildEmailVerificationTemplate({
				userName: 'John',
				verificationUrl: 'https://example.com/verify',
			}),
		).toContain('https://example.com/verify');
		expect(
			buildPasswordResetTemplate({
				userName: 'John',
				resetUrl: 'https://example.com/reset',
			}),
		).toContain('https://example.com/reset');
	});
});
