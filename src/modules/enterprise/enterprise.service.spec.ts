import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { TransactionContext } from '../../shared/db/transaction/transaction-context.js';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
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

    mockEnterpriseConfigCreate = vi.fn().mockImplementation((config) => config);
    mockEnterpriseConfigSave = vi.fn().mockImplementation((config) => config);

    mockEnterpriseRepository = {
      save: mockEnterpriseSave,
      create: mockEnterpriseCreate,
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
});
