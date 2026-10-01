import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TransactionContext } from './transaction-context.js';
import { TransactionHandlerImpl } from './transaction-handler-impl.js';

describe('Transaction Handler Impl test', () => {
  let transactionHandlerImpl: TransactionHandlerImpl;
  let mockTransaction: Mock;
  const entityManager = {} as EntityManager;
  let mockGetRepository: Mock;
  const mockTransactionContext: TransactionContext = {
    enterpriseRepository: {},
    enterpriseConfigRepository: {},
  } as TransactionContext;

  beforeEach(async () => {
    mockGetRepository = vi.fn().mockReturnValue({});

    entityManager.getRepository = mockGetRepository;

    mockTransaction = vi
      .fn()
      .mockImplementation(async (callback) => callback(entityManager));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionHandlerImpl,
        {
          provide: DataSource,
          useValue: {
            transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    transactionHandlerImpl = module.get<TransactionHandlerImpl>(
      TransactionHandlerImpl,
    );
  });

  it('should be defined', () => {
    expect(transactionHandlerImpl).toBeDefined();
  });

  it('should call transaction method and return result of DataSource with execute handle method', async () => {
    // GIVEN
    const transactionCallback = vi.fn().mockResolvedValue(true);

    // WHEN
    const result = await transactionHandlerImpl.handle(transactionCallback);

    // THEN
    expect(result).toBeDefined();
    expect(result).toBeTruthy();

    expect(mockTransaction).toHaveBeenCalled();
    expect(transactionCallback).toHaveBeenCalledWith(mockTransactionContext);
  });

  it('should call transaction and fail when execute handle method', async (): Promise<void> => {
    // GIVEN
    const transactionCallback = vi
      .fn()
      .mockRejectedValue(new Error('Operation failed'));

    // WHEN
    const execution = transactionHandlerImpl.handle(transactionCallback);

    // THEN

    await expect(execution).rejects.toThrow('Operation failed');
    expect(mockTransaction).toHaveBeenCalled();
    expect(transactionCallback).toHaveBeenCalledWith(mockTransactionContext);
  });
});
