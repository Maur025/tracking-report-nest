import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { EnterpriseConfigService } from './enterprise-config.service.js';
import { EnterpriseConfig } from './entities/enterprise-config.entity.js';

describe('EnterpriseConfigService', () => {
  let service: EnterpriseConfigService;

  let mockFindOneOrFail: Mock;

  beforeEach(async () => {
    mockFindOneOrFail = vi.fn().mockResolvedValue({
      host: 'localhost',
      port: '5432',
      database: 'test',
      referenceId: 'ref123',
      enterpriseRefId: 'ent123',
      hostUrl: 'http://localhost:5432',
      enterprise: {
        id: 'ent123',
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseConfigService,
        {
          provide: getRepositoryToken(EnterpriseConfig),
          useValue: {
            findOneOrFail: mockFindOneOrFail,
          },
        },
      ],
    }).compile();

    service = module.get<EnterpriseConfigService>(EnterpriseConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return config enterprise', async () => {
    // GIVEN
    const databaseName = 'test';

    // WHEN
    const enterpriseConfig = await service.findByDatabaseNameThrow({
      databaseName,
    });

    // THEN
    expect(mockFindOneOrFail).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { database: databaseName },
        relations: { enterprise: true },
      }),
    );
    expect(enterpriseConfig).toBeDefined();
    expect(enterpriseConfig).toEqual(
      expect.objectContaining({
        host: 'localhost',
        port: '5432',
        database: 'test',
        referenceId: 'ref123',
        enterpriseRefId: 'ent123',
        hostUrl: 'http://localhost:5432',
        enterprise: expect.objectContaining({
          id: 'ent123',
        }),
      }),
    );
  });

  it('should fail when database is not found', async () => {
    // GIVEN
    const databaseName = 'test';
    mockFindOneOrFail.mockRejectedValue('Database not found');

    // WHEN
    const execution = service.findByDatabaseNameThrow({
      databaseName,
    });

    // THEN
    await expect(execution).rejects.toThrow('Database not found');

    expect(mockFindOneOrFail).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { database: databaseName },
        relations: { enterprise: true },
      }),
    );
  });
});
