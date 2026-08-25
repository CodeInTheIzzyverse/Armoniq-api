import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
	uri: string;
	retryAttempts: number;
	retryDelay: number;
	connectTimeoutMS: number;
	socketTimeoutMS: number;
	serverSelectionTimeoutMS: number;
	maxPoolSize: number;
}

export default registerAs('database', () => ({
	uri: process.env.MONGODB_URI || '',
	retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
	retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
	connectTimeoutMS: parseInt(
		process.env.DB_CONNECT_TIMEOUT_MS || '10000',
		10,
	),
	socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS || '45000', 10),
	serverSelectionTimeoutMS: parseInt(
		process.env.DB_SERVER_SELECTION_TIMEOUT_MS || '30000',
		10,
	),
	maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
}));
