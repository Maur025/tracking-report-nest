import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ProgressReportQueryParams } from '../dto/progress-report-query-params.js';
import { ProgressConsumerService } from './progress-consumer.service.js';
import { ProgressService } from './progress.service.js';

describe('ProgressConsumerService', () => {
  let service: ProgressConsumerService;
  let mockGenerateReportStream: Mock;
  let stream: PassThrough;

  beforeEach(async () => {
    stream = new PassThrough();
    mockGenerateReportStream = vi.fn().mockResolvedValue(stream);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressConsumerService,
        {
          provide: ProgressService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
      ],
    }).compile();

    service = module.get<ProgressConsumerService>(ProgressConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose the progress report type', () => {
    expect(service.type).toBe('progress');
  });

  describe('generate', () => {
    it('should delegate the generation to the progress service with the stored payload', async () => {
      // GIVEN
      const payload = {
        databaseName: 'enterprise_1_db',
        format: 'pdf',
      } as ProgressReportQueryParams;

      const reportRequest = {
        id: 'report-1',
        payload,
      } as unknown as ReportRequest;

      // WHEN
      const result = await service.generate(reportRequest);

      // THEN
      expect(mockGenerateReportStream).toHaveBeenCalledWith(payload);
      expect(mockGenerateReportStream).toHaveBeenCalledTimes(1);
      expect(mockGenerateReportStream.mock.calls[0][0]).toBe(payload);
      expect(result).toBe(stream);
    });

    it('should propagate the error raised by the progress service', async () => {
      // GIVEN
      const error = new Error('Generation failed');
      mockGenerateReportStream.mockRejectedValue(error);

      // WHEN / THEN
      await expect(
        service.generate({ id: 'report-1', payload: {} } as ReportRequest),
      ).rejects.toBe(error);
    });
  });
});
