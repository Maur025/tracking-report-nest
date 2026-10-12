import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RegistryProgressService } from './registry-progress.service.js';

describe('RegistryProgressService', () => {
  let service: RegistryProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistryProgressService],
    }).compile();

    service = module.get<RegistryProgressService>(RegistryProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
