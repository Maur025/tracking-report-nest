import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';
import { ReportRequest } from '../entities/report-request.entity.js';
import { ReportRequestService } from './report-request.service.js';

describe('ReportRequestService', () => {
  let service: ReportRequestService;

  let mockFindAndCount: Mock;
  let mockCreate: Mock;
  let mockSave: Mock;
  let mockFindOneBy: Mock;
  let mockPreload: Mock;

  const reportRequests = [
    { id: '1', status: 'PENDING' },
    { id: '2', status: 'COMPLETED' },
  ] as ReportRequest[];

  beforeEach(async () => {
    mockFindAndCount = vi.fn().mockResolvedValue([reportRequests, 2]);
    mockCreate = vi.fn().mockImplementation((data) => data);
    mockSave = vi.fn().mockImplementation((data) => data);
    mockFindOneBy = vi.fn().mockResolvedValue(reportRequests[0]);
    mockPreload = vi.fn().mockImplementation((data) => data);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportRequestService,
        {
          provide: getRepositoryToken(ReportRequest),
          useValue: {
            findAndCount: mockFindAndCount,
            create: mockCreate,
            save: mockSave,
            findOneBy: mockFindOneBy,
            preload: mockPreload,
          },
        },
      ],
    }).compile();

    service = module.get<ReportRequestService>(ReportRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and persist the report request', async () => {
      // GIVEN
      const dto = {
        type: 'event',
        payload: { databaseName: 'db' },
      } as any;

      // WHEN
      const result = await service.create(dto);

      // THEN
      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(mockSave).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
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

  describe('findOneByIdThrow', () => {
    it('should return the report request when it exists', async () => {
      // WHEN
      const result = await service.findOneByIdThrow('1');

      // THEN
      expect(mockFindOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toBe(reportRequests[0]);
    });

    it('should throw a NotFoundException when the report request does not exist', async () => {
      // GIVEN
      mockFindOneBy.mockResolvedValue(null);

      // WHEN / THEN
      await expect(service.findOneByIdThrow('missing')).rejects.toThrow(
        new NotFoundException('Report request with id missing not found'),
      );
    });
  });

  describe('update', () => {
    it('should preload and persist the report request', async () => {
      // GIVEN
      const dto = { status: 'COMPLETED' } as any;

      // WHEN
      const result = await service.update('1', dto);

      // THEN
      expect(mockPreload).toHaveBeenCalledWith({ id: '1', ...dto });
      expect(mockSave).toHaveBeenCalledWith({ id: '1', ...dto });
      expect(result).toEqual({ id: '1', ...dto });
    });

    it('should throw a NotFoundException when the report request cannot be preloaded', async () => {
      // GIVEN
      mockPreload.mockResolvedValue(undefined);

      // WHEN / THEN
      await expect(
        service.update('missing', { status: 'COMPLETED' } as any),
      ).rejects.toThrow(
        new NotFoundException('Report request with id missing not found'),
      );
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when the persistence fails', async () => {
      // GIVEN
      mockSave.mockRejectedValue(new Error('database is locked'));

      // WHEN / THEN
      await expect(
        service.update('1', { status: 'COMPLETED' } as any),
      ).rejects.toThrow(
        new BadRequestException(
          'Failed to update report request with id 1: database is locked',
        ),
      );
    });

    it('should report an unknown error when the failure is not an Error instance', async () => {
      // GIVEN
      mockSave.mockRejectedValue('boom');

      // WHEN / THEN
      await expect(
        service.update('1', { status: 'COMPLETED' } as any),
      ).rejects.toThrow(
        new BadRequestException(
          'Failed to update report request with id 1: Unknown error',
        ),
      );
    });
  });
});
