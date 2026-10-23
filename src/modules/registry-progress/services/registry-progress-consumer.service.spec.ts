import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RegistryProgressConsumerService } from './registry-progress-consumer.service.js';
import { RegistryProgressService } from './registry-progress.service.js';

describe('RegistryProgressConsumerService', () => {
  let service: RegistryProgressConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryProgressConsumerService,
        { provide: RegistryProgressService, useValue: {} },
      ],
    }).compile();

    service = module.get<RegistryProgressConsumerService>(
      RegistryProgressConsumerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
