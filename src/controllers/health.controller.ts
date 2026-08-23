import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';
import {
  HealthCheckResponse,
  HealthStatus,
  LivenessResponse,
  ReadinessResponse,
} from '../dto/health.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Full health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthCheckResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is degraded or unavailable',
    type: HealthCheckResponse,
  })
  async check(): Promise<HealthCheckResponse> {
    const health = await this.healthService.check();
    if (health.status === HealthStatus.ERROR) {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe (Kubernetes)' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    type: LivenessResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not alive',
  })
  checkLiveness(): LivenessResponse {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe (Kubernetes)' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to accept traffic',
    type: ReadinessResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
    type: ReadinessResponse,
  })
  async checkReadiness(): Promise<ReadinessResponse> {
    const health = await this.healthService.checkReadiness();
    if (health.status === HealthStatus.ERROR) {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }
}
