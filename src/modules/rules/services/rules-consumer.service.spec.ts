import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { RulesReportQueryParams } from '../dto/rules-report-query-params.js';
import { RulesConsumerService } from './rules-consumer.service.js';
import { RulesService } from './rules.service.js';

describe('RulesConsumerService', () => {
  let service: RulesConsumerService;

  let mockGenerateReportStream: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockGenerateReportStream = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesConsumerService,
        {
          provide: RulesService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
      ],
    }).compile();

    service = module.get<RulesConsumerService>(RulesConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose the rules report type', () => {
    expect(service.type).toBe(ReportTypeEnum.RULES);
  });

  it('should delegate the original payload and return the same stream', async () => {
    const payload = {
      databaseName: 'db',
      format: 'excel',
    } as RulesReportQueryParams;
    const stream = new PassThrough();
    mockGenerateReportStream.mockResolvedValue(stream);

    const result = await service.generate({
      payload,
    } as unknown as ReportRequest);

    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(payload);
    expect(mockGenerateReportStream.mock.calls[0][0]).toBe(payload);
    expect(result).toBe(stream);
  });

  it('should propagate the report generation error', async () => {
    const error = new Error('Generation failed');
    const payload = {
      databaseName: 'db',
      format: 'pdf',
    } as RulesReportQueryParams;
    mockGenerateReportStream.mockRejectedValue(error);

    await expect(
      service.generate({ payload } as unknown as ReportRequest),
    ).rejects.toBe(error);
    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(payload);
  });
});
