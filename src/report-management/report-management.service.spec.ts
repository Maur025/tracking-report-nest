import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportRequest } from './entities/report-request.entity.js';
import { ReportManagementService } from './report-management.service.js';

describe('ReportManagementService', () => {
  let service: ReportManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportManagementService,
        { provide: getRepositoryToken(ReportRequest), useValue: {} },
      ],
    }).compile();

    service = module.get<ReportManagementService>(ReportManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
