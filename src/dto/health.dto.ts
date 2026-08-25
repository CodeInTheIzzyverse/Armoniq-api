import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
	OK = 'ok',
	ERROR = 'error',
	DEGRADED = 'degraded',
}

export class HealthCheckResponse {
	@ApiProperty({
		enum: HealthStatus,
		description: 'Overall health status',
		example: HealthStatus.OK,
	})
	status!: HealthStatus;

	@ApiProperty({
		description: 'Timestamp of the health check',
		example: '2024-01-15T10:30:00.000Z',
	})
	timestamp!: string;

	@ApiProperty({
		description: 'Application uptime in seconds',
		example: 12345.67,
	})
	uptime!: number;

	@ApiProperty({
		description: 'Service-specific health information',
		example: {
			database: { status: 'ok', latency: 5 },
			memory: { status: 'ok', used: '150MB' },
		},
		required: false,
	})
	info?: Record<string, unknown>;

	@ApiProperty({
		description: 'Error details if status is error',
		required: false,
	})
	error?: {
		message: string;
		details?: Record<string, unknown>;
	};
}

export class LivenessResponse {
	@ApiProperty({
		enum: HealthStatus,
		description: 'Liveness status',
		example: HealthStatus.OK,
	})
	status!: HealthStatus;

	@ApiProperty({
		description: 'Timestamp',
		example: '2024-01-15T10:30:00.000Z',
	})
	timestamp!: string;
}

export class ReadinessResponse {
	@ApiProperty({
		enum: HealthStatus,
		description: 'Readiness status',
		example: HealthStatus.OK,
	})
	status!: HealthStatus;

	@ApiProperty({
		description: 'Timestamp',
		example: '2024-01-15T10:30:00.000Z',
	})
	timestamp!: string;

	@ApiProperty({
		description: 'Dependency health checks',
		example: {
			database: { status: 'ok', latency: 5 },
		},
	})
	checks!: Record<string, unknown>;
}
