import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  uri: string;
}

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || '',
}));
