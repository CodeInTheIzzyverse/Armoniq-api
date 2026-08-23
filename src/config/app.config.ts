import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  frontendUrls: string[];
}

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrls: (
    process.env.FRONTEND_URLS || 'http://localhost:3000,http://localhost:3001'
  ).split(','),
}));
