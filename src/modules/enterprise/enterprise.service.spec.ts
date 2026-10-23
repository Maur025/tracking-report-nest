import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { TransactionContext } from '../../shared/db/transaction/transaction-context.js';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto.js';
import { EnterpriseService } from './enterprise.service.js';
import { EnterpriseConfig } from './entities/enterprise-config.entity.js';
import { Enterprise } from './entities/enterprise.entity.js';

describe('EnterpriseService', () => {
  let service: EnterpriseService;
  let mockHandle: Mock;

  let mockTransactionContext: TransactionContext;

  let mockEnterpriseRepository: Repository<Enterprise>;
  let mockEnterpriseCreate: Mock;
  let mockEnterpriseSave: Mock;
  let mockEnterpriseFindAndCount: Mock;
  let mockEnterpriseFindOneBy: Mock;
  let mockEnterpriseRemove: Mock;

  let mockEnterpriseConfigRepository: Repository<EnterpriseConfig>;
  let mockEnterpriseConfigCreate: Mock;
  let mockEnterpriseConfigSave: Mock;

  let mockEnterpriseDataDto: CreateEnterpriseDto;

  const mockEnterpriseEntity: Enterprise = {
    id: 'uuid-to-save',
    name: 'Test Enterprise',
    description: 'This is a test enterprise',
    color: '#FF5733',
    image: 'base64encodedstring',
  } as Enterprise;

  beforeEach(async () => {
    mockEnterpriseDataDto = getMockEnterpriseDataDto();

    mockEnterpriseCreate = vi.fn().mockReturnValue(mockEnterpriseEntity);
    mockEnterpriseSave = vi.fn().mockResolvedValue(mockEnterpriseEntity);
    mockEnterpriseFindAndCount = vi
      .fn()
      .mockResolvedValue([[mockEnterpriseEntity], 1]);
    mockEnterpriseFindOneBy = vi.fn().mockResolvedValue(mockEnterpriseEntity);
    mockEnterpriseRemove = vi.fn().mockResolvedValue(mockEnterpriseEntity);

    mockEnterpriseConfigCreate = vi.fn().mockImplementation((config) => config);
    mockEnterpriseConfigSave = vi.fn().mockImplementation((config) => config);

    mockEnterpriseRepository = {
      save: mockEnterpriseSave,
      create: mockEnterpriseCreate,
      findAndCount: mockEnterpriseFindAndCount,
      findOneBy: mockEnterpriseFindOneBy,
      remove: mockEnterpriseRemove,
    } as unknown as Repository<Enterprise>;

    mockEnterpriseConfigRepository = {
      save: mockEnterpriseConfigSave,
      create: mockEnterpriseConfigCreate,
    } as unknown as Repository<EnterpriseConfig>;

    mockTransactionContext = {
      enterpriseRepository: mockEnterpriseRepository,
      enterpriseConfigRepository: mockEnterpriseConfigRepository,
    } as TransactionContext;

    mockHandle = vi
      .fn()
      .mockImplementation(async (callback) => callback(mockTransactionContext));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseService,
        {
          provide: TransactionHandler,
          useValue: {
            handle: mockHandle,
          },
        },
        {
          provide: getRepositoryToken(Enterprise),
          useValue: mockEnterpriseRepository,
        },
      ],
    }).compile();

    service = module.get<EnterpriseService>(EnterpriseService);
  });

  const getMockEnterpriseDataDto = () => ({
    id: 'uuid-to-save',
    name: 'Test Enterprise',
    description: 'This is a test enterprise',
    color: '#FF5733',
    image: 'base64encodedstring',
    enterpriseConfigs: [
      {
        host: 'localhost',
        port: '5432',
        database: 'test_db',
        referenceId: 'ref-123',
      },
      {
        host: 'localhost',
        port: '5522',
        database: 'test_db_2',
        referenceId: 'ref-456',
      },
    ],
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create enterprise and return its ID', async () => {
      // GIVEN

      // WHEN
      const enterpriseId = await service.create(mockEnterpriseDataDto);

      // THEN

      expect(enterpriseId).toBeDefined();
      expect(enterpriseId).toBe(mockEnterpriseDataDto.id);
      expect(mockHandle).toHaveBeenCalledWith(expect.any(Function));
      expect(mockEnterpriseSave).toHaveBeenCalledWith(
        expect.objectContaining(mockEnterpriseEntity),
      );
      expect(mockEnterpriseConfigCreate).toHaveBeenCalledTimes(2);

      for (const config of mockEnterpriseDataDto.enterpriseConfigs) {
        expect(mockEnterpriseConfigCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            host: config.host,
            port: config.port,
            database: config.database,
            referenceId: config.referenceId,
            enterpriseRefId: mockEnterpriseDataDto.id,
          }),
        );
      }

      expect(mockEnterpriseConfigSave).toHaveBeenCalledWith(
        expect.arrayContaining(
          mockEnterpriseDataDto.enterpriseConfigs.map((config) =>
            expect.objectContaining({
              host: config.host,
              port: config.port,
              database: config.database,
              referenceId: config.referenceId,
              enterpriseRefId: mockEnterpriseDataDto.id,
            }),
          ),
        ),
      );
    });

    it('should fail when enterprise configs cannot be saved', async () => {
      // GIVEN
      const error = new Error('Failed to save enterprise configs');
      mockEnterpriseConfigSave.mockRejectedValue(error);

      // WHEN
      const execution = service.create(mockEnterpriseDataDto);

      // THEN

      await expect(execution).rejects.toThrow(
        'Failed to save enterprise configs',
      );
    });
  });

  describe('findAll', () => {
    const paginationDto = {
      page: 1,
      size: 20,
      descending: false,
      sortBy: 'name',
    } as PaginationDto;

    it('should query enterprises with the given pagination and sort', async () => {
      // WHEN
      const result = await service.findAll(paginationDto);

      // THEN
      expect(mockEnterpriseFindAndCount).toHaveBeenCalledWith({
        take: 20,
        skip: 20,
        order: { name: { direction: 'ASC', nulls: 'LAST' } },
      });
      expect(result).toEqual({
        data: [mockEnterpriseEntity],
        pagination: { count: 1, pages: 1 },
      });
    });

    it('should sort descending when the descending flag is enabled', async () => {
      // WHEN
      await service.findAll({
        page: 1,
        size: 20,
        descending: true,
        sortBy: 'name',
      } as PaginationDto);

      // THEN
      expect(mockEnterpriseFindAndCount.mock.calls[0][0].order).toEqual({
        name: { direction: 'DESC', nulls: 'LAST' },
      });
    });
  });

  describe('findOne', () => {
    it('should return the enterprise when it exists', async () => {
      // WHEN
      const result = await service.findOne('uuid-to-save');

      // THEN
      expect(mockEnterpriseFindOneBy).toHaveBeenCalledWith({
        id: 'uuid-to-save',
      });
      expect(result).toBe(mockEnterpriseEntity);
    });

    it('should throw a NotFoundException when the enterprise does not exist', async () => {
      // GIVEN
      mockEnterpriseFindOneBy.mockResolvedValue(null);

      // WHEN
      const execution = service.findOne('missing-id');

      // THEN
      await expect(execution).rejects.toThrow(NotFoundException);
      await expect(execution).rejects.toThrow(
        'Enterprise with id missing-id not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove the existing enterprise', async () => {
      // WHEN
      await service.remove('uuid-to-save');

      // THEN
      expect(mockEnterpriseFindOneBy).toHaveBeenCalledWith({
        id: 'uuid-to-save',
      });
      expect(mockEnterpriseRemove).toHaveBeenCalledWith(mockEnterpriseEntity);
    });

    it('should not remove anything when the enterprise does not exist', async () => {
      // GIVEN
      mockEnterpriseFindOneBy.mockResolvedValue(null);

      // WHEN
      const execution = service.remove('missing-id');

      // THEN
      await expect(execution).rejects.toThrow(NotFoundException);
      expect(mockEnterpriseRemove).not.toHaveBeenCalled();
    });
  });
});
