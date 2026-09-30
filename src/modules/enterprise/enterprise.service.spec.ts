import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { EnterpriseService } from './enterprise.service.js';

describe('EnterpriseService', () => {
  let service: EnterpriseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnterpriseService],
    }).compile();

    service = module.get<EnterpriseService>(EnterpriseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
