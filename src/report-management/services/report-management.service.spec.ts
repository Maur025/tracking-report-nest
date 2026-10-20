import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportManagementService } from './report-management.service.js';

describe('ReportManagementService', () => {
  let service: ReportManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportManagementService],
    }).compile();

    service = module.get<ReportManagementService>(ReportManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
