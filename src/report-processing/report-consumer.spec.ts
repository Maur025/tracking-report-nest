import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { GenerateReportJob } from '../infrastructure/queue/queue-values.js';
import { ReportRequestService } from '../report-management/services/report-request.service.js';
import { ReportConsumer } from './report-consumer.js';
import { ReportGenerateStrategyService } from './report-generate-strategy.service.js';

describe('ReportConsumer', () => {
  let service: ReportConsumer;

  let mockGetOrThrow: Mock;
  let mockReportRequestUpdate: Mock;
  let mockReportRequestFindOneByIdThrow: Mock;

  const buildJob = (name: string) =>
    ({ name, data: { reportId: 'report-123' } }) as Job<GenerateReportJob>;

  beforeEach(async () => {
    mockGetOrThrow = vi.fn().mockReturnValue('./public');
    mockReportRequestFindOneByIdThrow = vi.fn();
    mockReportRequestUpdate = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportConsumer,
        {
          provide: ReportRequestService,
          useValue: {
            findOneByIdThrow: mockReportRequestFindOneByIdThrow,
            update: mockReportRequestUpdate,
          },
        },
        { provide: ReportGenerateStrategyService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: mockGetOrThrow,
          },
        },
      ],
    }).compile();

    service = module.get<ReportConsumer>(ReportConsumer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
