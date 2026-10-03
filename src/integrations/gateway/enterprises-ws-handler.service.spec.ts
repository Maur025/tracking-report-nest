import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { TransactionContext } from '../../shared/db/transaction/transaction-context.js';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
import { EnterpriseWsPayload } from './dto/enterprises-ws-payload.interface.js';
import { EnterprisesWsHandlerService } from './enterprises-ws-handler.service.js';

describe('EnterprisesWsHandlerService', () => {
  let service: EnterprisesWsHandlerService;
  let wsPayload: EnterpriseWsPayload[];

  let mockHandle: Mock;
  let mockTransactionContext: TransactionContext;

  let mockEnterpriseCreate: Mock;
  let mockEnterpriseSave: Mock;

  let mockEnterpriseConfigCreate: Mock;
  let mockEnterpriseConfigSave: Mock;

  beforeEach(async () => {
    wsPayload = getWsPayload();

    mockEnterpriseCreate = vi
      .fn()
      .mockImplementation((enterprise) => enterprise);

    mockEnterpriseSave = vi.fn().mockImplementation((enterprise) => enterprise);

    mockEnterpriseConfigCreate = vi.fn().mockImplementation((config) => config);
    mockEnterpriseConfigSave = vi.fn().mockImplementation((config) => config);

    mockTransactionContext = {
      enterpriseRepository: {
        save: mockEnterpriseSave,
        create: mockEnterpriseCreate,
      },
      enterpriseConfigRepository: {
        save: mockEnterpriseConfigSave,
        create: mockEnterpriseConfigCreate,
      },
    } as unknown as TransactionContext;

    mockHandle = vi
      .fn()
      .mockImplementation(async (callback) => callback(mockTransactionContext));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterprisesWsHandlerService,
        {
          provide: TransactionHandler,
          useValue: {
            handle: mockHandle,
          },
        },
      ],
    }).compile();

    service = module.get<EnterprisesWsHandlerService>(
      EnterprisesWsHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save enterprises with configurations', async () => {
    // GIVEN

    // WHEN
    await service.saveEnterprisesWithConfigurations(wsPayload);

    // THEN
    expect(mockHandle).toHaveBeenCalledTimes(1);
    expect(mockEnterpriseCreate).toHaveBeenCalledTimes(wsPayload.length);
    expect(mockEnterpriseConfigCreate).toHaveBeenCalledTimes(wsPayload.length);

    expect(mockEnterpriseSave).toHaveBeenCalledWith(expect.arrayContaining([]));
    expect(mockEnterpriseConfigSave).toHaveBeenCalledWith(
      expect.arrayContaining([]),
    );
  });

  const getWsPayload = (): EnterpriseWsPayload[] => [
    {
      id: 'enterprise-id-1',
      name: 'enterprise test',
      description: 'description test',
      color: '#424567',
      image: 'data:file...',
      user_id: 'user-id-1',
      user_database_id: 'user-database-id-1',
      monitor_server_id: 'monitor-server-id-1',
      create_at: 1783800770835,
      update_at: null,
      deleted: 0,
      enabled: 1,
      database: {
        id: 'database-id-1',
        codename: 'databaseE1',
        description: 'description test',
        fullname: 'enterprise test 1',
        server_id: 'server-id-1',
        enabled: 1,
        server: {
          id: 'server-id-1',
          name: 'server-name',
          type: 'tracking-backend',
          environment: 'public',
          server_uuid: 'ffffffff',
          address: '10.10.10.10',
          portUdp: 5401,
          portTcp: 6401,
          portWs: 7401,
          portHttp: 8401,
          apiPort: 9988,
          create_at: 1783799304158,
          update_at: 1790899663078,
        },
      },
    },
    {
      id: 'enterprise-id-2',
      name: 'enterprise test 2',
      description: 'description test 2',
      color: '#1b2027',
      image: 'data:image/jpeg;base64...',
      user_id: 'user-id-2',
      user_database_id: 'user-database-id-2',
      monitor_server_id: 'monitor-server-id-2',
      create_at: 1790624656638,
      update_at: null,
      deleted: 0,
      enabled: 1,
      database: {
        id: 'database-id-2',
        codename: 'databaseE2',
        description: 'description test 2',
        fullname: 'enterprise test 2',
        server_id: 'server-id-2',
        enabled: 1,
        server: {
          id: 'server-id-2',
          name: 'server-name-2',
          type: 'tracking-backend',
          environment: 'public',
          server_uuid: 'fafaf0f0',
          address: '11.11.11.11',
          portUdp: 5401,
          portTcp: 6401,
          portWs: 7401,
          portHttp: 8401,
          apiPort: 9988,
          create_at: 1783799304158,
          update_at: 1790899663078,
        },
      },
    },
  ];
});
