import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  resendApiKey: string;
  mailFrom: string;
  mailFromName: string;
}

export default registerAs('email', () => ({
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'noreply@armoniq.com',
  mailFromName: process.env.MAIL_FROM_NAME || 'Armoniq',
}));
