import { registerAs } from '@nestjs/config';

export interface PaymentConfig {
  wompiPublicKey: string;
  wompiPrivateKey: string;
  wompiBaseUrl: string;
}

export default registerAs('payment', () => ({
  wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || '',
  wompiPrivateKey: process.env.WOMPI_PRIVATE_KEY || '',
  wompiBaseUrl: process.env.WOMPI_BASE_URL || 'https://sandbox.wompi.co/v1',
}));
