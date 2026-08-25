import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
	HealthCheckResponse,
	HealthStatus,
	LivenessResponse,
	ReadinessResponse,
} from '../dto/health.dto';

@Injectable()
export class HealthService {
	private readonly logger = new Logger(HealthService.name);
	private readonly startTime: number;

	constructor(@InjectConnection() private readonly connection: Connection) {
		this.startTime = Date.now();
	}

	async check(): Promise<HealthCheckResponse> {
		const info: Record<string, any> = {};
		let overallStatus = HealthStatus.OK;

		// Database check
		const dbHealth = await this.checkDatabase();
		info.database = dbHealth;
		if (dbHealth.status !== HealthStatus.OK) {
			overallStatus = HealthStatus.DEGRADED;
		}

		// Memory check
		const memoryHealth = this.checkMemory();
		info.memory = memoryHealth;
		if (memoryHealth.status !== HealthStatus.OK) {
			overallStatus = HealthStatus.DEGRADED;
		}

		return {
			status: overallStatus,
			timestamp: new Date().toISOString(),
			uptime: (Date.now() - this.startTime) / 1000,
			info,
		};
	}

	checkLiveness(): LivenessResponse {
		return {
			status: HealthStatus.OK,
			timestamp: new Date().toISOString(),
		};
	}

	async checkReadiness(): Promise<ReadinessResponse> {
		const checks: Record<string, any> = {};
		let overallStatus = HealthStatus.OK;

		// Database check
		const dbHealth = await this.checkDatabase();
		checks.database = dbHealth;
		if (dbHealth.status !== HealthStatus.OK) {
			overallStatus = HealthStatus.ERROR;
		}

		return {
			status: overallStatus,
			timestamp: new Date().toISOString(),
			checks,
		};
	}

	private async checkDatabase(): Promise<{
		status: HealthStatus;
		latency?: number;
		error?: string;
	}> {
		const start = Date.now();
		try {
			const readyState: number = this.connection.readyState;
			const isConnected = readyState === 1;
			if (isConnected && this.connection.db) {
				await this.connection.db.admin().ping();
				const latency = Date.now() - start;
				return {
					status: HealthStatus.OK,
					latency,
				};
			}
			return {
				status: HealthStatus.ERROR,
				error: 'Database connection not ready',
			};
		} catch (error) {
			this.logger.error('Database health check failed', error);
			return {
				status: HealthStatus.ERROR,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	private checkMemory(): {
		status: HealthStatus;
		used: string;
		total: string;
		percentage: number;
	} {
		const memUsage = process.memoryUsage();
		const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
		const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
		const percentage = Math.round(
			(memUsage.heapUsed / memUsage.heapTotal) * 100,
		);

		const status =
			percentage > 90 ? HealthStatus.DEGRADED : HealthStatus.OK;

		return {
			status,
			used: `${usedMB}MB`,
			total: `${totalMB}MB`,
			percentage,
		};
	}
}
