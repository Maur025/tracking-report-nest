import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RulesConsumerService } from './rules-consumer.service.js';
import { RulesService } from './rules.service.js';

describe('RulesConsumerService', () => {
  let service: RulesConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesConsumerService,
        { provide: RulesService, useValue: {} },
      ],
    }).compile();

    service = module.get<RulesConsumerService>(RulesConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
