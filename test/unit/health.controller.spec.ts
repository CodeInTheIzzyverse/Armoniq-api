import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from '../../src/controllers/health.controller';
import { HealthService } from '../../src/services/health.service';
import { HealthStatus } from '../../src/dto/health.dto';

describe('HealthController', () => {
  let controller: HealthController;

  const mockHealthService = {
    check: vi.fn(),
    checkLiveness: vi.fn(),
    checkReadiness: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check response when healthy', async () => {
      const mockResponse = {
        status: HealthStatus.OK,
        timestamp: new Date().toISOString(),
        uptime: 100,
        info: { database: { status: 'ok' } },
      };
      mockHealthService.check.mockResolvedValue(mockResponse);

      const result = await controller.check();

      expect(result).toEqual(mockResponse);
      expect(mockHealthService.check).toHaveBeenCalled();
    });

    it('should throw ServiceUnavailableException when status is error', async () => {
      const mockResponse = {
        status: HealthStatus.ERROR,
        timestamp: new Date().toISOString(),
        uptime: 100,
        error: { message: 'Database unavailable' },
      };
      mockHealthService.check.mockResolvedValue(mockResponse);

      await expect(controller.check()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('checkLiveness', () => {
    it('should return liveness response', () => {
      const mockResponse = {
        status: HealthStatus.OK,
        timestamp: new Date().toISOString(),
      };
      mockHealthService.checkLiveness.mockReturnValue(mockResponse);

      const result = controller.checkLiveness();

      expect(result).toEqual(mockResponse);
      expect(mockHealthService.checkLiveness).toHaveBeenCalled();
    });
  });

  describe('checkReadiness', () => {
    it('should return readiness response when ready', async () => {
      const mockResponse = {
        status: HealthStatus.OK,
        timestamp: new Date().toISOString(),
        checks: { database: { status: 'ok' } },
      };
      mockHealthService.checkReadiness.mockResolvedValue(mockResponse);

      const result = await controller.checkReadiness();

      expect(result).toEqual(mockResponse);
      expect(mockHealthService.checkReadiness).toHaveBeenCalled();
    });

    it('should throw ServiceUnavailableException when not ready', async () => {
      const mockResponse = {
        status: HealthStatus.ERROR,
        timestamp: new Date().toISOString(),
        checks: { database: { status: 'error' } },
      };
      mockHealthService.checkReadiness.mockResolvedValue(mockResponse);

      await expect(controller.checkReadiness()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
