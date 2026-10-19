import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { PaginationDto } from '../shared/dto/pagination.dto.js';
import { ReportRequest } from './entities/report-request.entity.js';
import { ReportManagementService } from './report-management.service.js';

describe('ReportManagementService', () => {
  let service: ReportManagementService;
  let mockFindAndCount: Mock;

  const reportRequests = [
    { id: '1', status: 'PENDING' },
    { id: '2', status: 'COMPLETED' },
  ] as ReportRequest[];

  beforeEach(async () => {
    mockFindAndCount = vi.fn().mockResolvedValue([reportRequests, 2]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportManagementService,
        {
          provide: getRepositoryToken(ReportRequest),
          useValue: { findAndCount: mockFindAndCount },
        },
      ],
    }).compile();

    service = module.get<ReportManagementService>(ReportManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should paginate, sort and wrap the report requests', async () => {
      // GIVEN
      const paginationDto = {
        page: 2,
        size: 10,
        descending: false,
        sortBy: 'createdAt',
      } as PaginationDto;

      // WHEN
      const result = await service.findAll(paginationDto);

      // THEN
      expect(mockFindAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 20,
        order: { createdAt: { direction: 'ASC', nulls: 'LAST' } },
      });
      expect(result).toEqual({
        data: reportRequests,
        pagination: { count: 2, pages: 1 },
      });
    });

    it('should order descending when the descending flag is set', async () => {
      // GIVEN
      const paginationDto = {
        page: 0,
        size: 10,
        descending: true,
        sortBy: 'status',
      } as PaginationDto;

      // WHEN
      await service.findAll(paginationDto);

      // THEN
      expect(mockFindAndCount.mock.calls[0][0].order).toEqual({
        status: { direction: 'DESC', nulls: 'LAST' },
      });
    });

    it('should report zero pages when there are no report requests', async () => {
      // GIVEN
      mockFindAndCount.mockResolvedValue([[], 0]);
      const paginationDto = {
        page: 0,
        size: 10,
        descending: false,
        sortBy: 'id',
      } as PaginationDto;

      // WHEN
      const result = await service.findAll(paginationDto);

      // THEN
      expect(result).toEqual({ data: [], pagination: { count: 0, pages: 0 } });
    });
  });
});
