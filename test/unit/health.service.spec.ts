import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthService } from '../../src/services/health.service';
import { HealthStatus } from '../../src/dto/health.dto';

interface MockConnection {
  readyState: number;
  db: {
    admin: () => { ping: ReturnType<typeof vi.fn> };
  } | null;
}

describe('HealthService', () => {
  let service: HealthService;
  let mockConnection: MockConnection;

  beforeEach(async () => {
    mockConnection = {
      readyState: 1,
      db: {
        admin: () => ({
          ping: vi.fn().mockResolvedValue({ ok: 1 }),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      const result = await service.check();

      expect(result.status).toBe(HealthStatus.OK);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.info).toBeDefined();
      expect(result.info?.database).toBeDefined();
      expect(result.info?.memory).toBeDefined();
    });

    it('should return degraded status when database check fails', async () => {
      mockConnection.readyState = 0;

      const result = await service.check();

      expect(result.status).toBe(HealthStatus.DEGRADED);
      const dbInfo = result.info?.database as { status: HealthStatus };
      expect(dbInfo.status).toBe(HealthStatus.ERROR);
    });

    it('should return degraded status when memory usage is high', async () => {
      vi.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 95 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
      });

      const result = await service.check();

      const memoryInfo = result.info?.memory as { status: HealthStatus };
      expect(memoryInfo.status).toBe(HealthStatus.DEGRADED);
    });
  });

  describe('checkLiveness', () => {
    it('should return ok status', () => {
      const result = service.checkLiveness();

      expect(result.status).toBe(HealthStatus.OK);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('checkReadiness', () => {
    it('should return ok status when database is ready', async () => {
      const result = await service.checkReadiness();

      expect(result.status).toBe(HealthStatus.OK);
      const dbCheck = result.checks.database as { status: HealthStatus };
      expect(dbCheck.status).toBe(HealthStatus.OK);
    });

    it('should return error status when database is not ready', async () => {
      mockConnection.readyState = 0;

      const result = await service.checkReadiness();

      expect(result.status).toBe(HealthStatus.ERROR);
      const dbCheck = result.checks.database as { status: HealthStatus };
      expect(dbCheck.status).toBe(HealthStatus.ERROR);
    });

    it('should return error status when database ping fails', async () => {
      mockConnection.db = {
        admin: () => ({
          ping: vi.fn().mockRejectedValue(new Error('Connection failed')),
        }),
      };

      const result = await service.checkReadiness();

      expect(result.status).toBe(HealthStatus.ERROR);
      const dbCheck = result.checks.database as {
        status: HealthStatus;
        error: string;
      };
      expect(dbCheck.status).toBe(HealthStatus.ERROR);
      expect(dbCheck.error).toBe('Connection failed');
    });
  });
});
