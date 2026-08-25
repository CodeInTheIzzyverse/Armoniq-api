import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	MongooseModuleOptions,
	MongooseOptionsFactory,
} from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { DatabaseConfig } from '../config/database.config';

@Injectable()
export class MongoConnection implements MongooseOptionsFactory {
	private readonly logger = new Logger(MongoConnection.name);

	constructor(private readonly configService: ConfigService) {}

	createMongooseOptions(): MongooseModuleOptions {
		const config = this.configService.get<DatabaseConfig>('database');

		if (!config?.uri) {
			throw new Error(
				'MONGODB_URI is not defined. Please set it in your .env file.',
			);
		}

		const {
			uri,
			retryAttempts,
			retryDelay,
			connectTimeoutMS,
			socketTimeoutMS,
			serverSelectionTimeoutMS,
			maxPoolSize,
		} = config;

		return {
			uri,
			retryAttempts,
			retryDelay,
			connectTimeoutMS,
			socketTimeoutMS,
			serverSelectionTimeoutMS,
			maxPoolSize,
			connectionFactory: (connection: Connection) => {
				connection.on('connected', () => {
					this.logger.log('MongoDB connected');
				});
				connection.on('disconnected', () => {
					this.logger.warn('MongoDB disconnected');
				});
				connection.on('error', (error: unknown) => {
					this.logger.error('MongoDB connection error', error);
				});
				return connection;
			},
		};
	}
}
