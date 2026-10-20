import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { PaginationDto } from '../shared/dto/pagination.dto.js';
import { ReportController } from './report.controller.js';
import { ReportManagementService } from './services/report-management.service.js';

describe('ReportManagementController', () => {
  let controller: ReportController;
  let mockFindAll: Mock;

  beforeEach(async () => {
    mockFindAll = vi.fn().mockResolvedValue({ data: [], pagination: {} });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ReportManagementService,
          useValue: { findAll: mockFindAll },
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('create', () => {
  //   it('should return the queue confirmation without touching the service', () => {
  //     // WHEN
  //     const result = controller.create();

  //     // THEN
  //     expect(result).toBe('Added to queue');
  //     expect(mockFindAll).not.toHaveBeenCalled();
  //   });
  // });

  describe('findAll', () => {
    it('should delegate to the report management service', async () => {
      // GIVEN
      const paginationDto = { page: 0, size: 10 } as PaginationDto;
      const expected = {
        data: [{ id: '1' }],
        pagination: { count: 1, pages: 1 },
      };
      mockFindAll.mockResolvedValue(expected);

      // WHEN
      const result = await controller.findAll(paginationDto);

      // THEN
      expect(mockFindAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toBe(expected);
    });

    it('should propagate errors raised by the service', async () => {
      // GIVEN
      mockFindAll.mockRejectedValue(new Error('database down'));
      const paginationDto = { page: 0, size: 10 } as PaginationDto;

      // WHEN / THEN
      await expect(controller.findAll(paginationDto)).rejects.toThrow(
        'database down',
      );
    });
  });
});
