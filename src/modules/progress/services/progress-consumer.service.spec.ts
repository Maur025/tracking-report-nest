import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressConsumerService } from './progress-consumer.service.js';
import { ProgressService } from './progress.service.js';

describe('ProgressConsumerService', () => {
  let service: ProgressConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressConsumerService,
        { provide: ProgressService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProgressConsumerService>(ProgressConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
