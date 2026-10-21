import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportGenerateStrategyService } from './report-generate-strategy.service.js';
import { REPORT_GENERATORS } from './report-generators-token.js';

describe('ReportGenerateStrategyService', () => {
  let service: ReportGenerateStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportGenerateStrategyService,
        { provide: REPORT_GENERATORS, useValue: [] },
      ],
    }).compile();

    service = module.get<ReportGenerateStrategyService>(
      ReportGenerateStrategyService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
