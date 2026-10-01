import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
import { EnterpriseController } from './enterprise.controller.js';
import { EnterpriseService } from './enterprise.service.js';

describe('EnterpriseController', () => {
  let controller: EnterpriseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnterpriseController],
      providers: [
        EnterpriseService,
        { provide: TransactionHandler, useValue: { handle: vi.fn() } },
      ],
    }).compile();

    controller = module.get<EnterpriseController>(EnterpriseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
