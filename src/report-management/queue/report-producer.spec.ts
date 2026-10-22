import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  GenerateReportJob,
  REPORT_JOBS,
  REPORT_QUEUE_NAME,
} from '../../infrastructure/queue/queue-values.js';
import { ReportProducer } from './report-producer.js';

describe('ReportProducer', () => {
  let service: ReportProducer;
  let mockQueueAdd: Mock;

  const job: GenerateReportJob = { reportId: 'report-123' };

  beforeEach(async () => {
    mockQueueAdd = vi.fn().mockResolvedValue({ id: 'enqueued-job' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportProducer,
        {
          provide: getQueueToken(REPORT_QUEUE_NAME),
          useValue: { add: mockQueueAdd },
        },
      ],
    }).compile();

    service = module.get<ReportProducer>(ReportProducer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePdf', () => {
    it('should enqueue a GENERATE_PDF job with a pdf prefixed job id', async () => {
      // WHEN
      const result = await service.generatePdf(job);

      // THEN
      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
      expect(mockQueueAdd).toHaveBeenCalledWith(REPORT_JOBS.GENERATE_PDF, job, {
        jobId: 'pdf-report-123',
      });
      expect(result).toEqual({ id: 'enqueued-job' });
    });

    it('should build the job id from the received report id', async () => {
      // WHEN
      await service.generatePdf({ reportId: 'another-report' });

      // THEN
      expect(mockQueueAdd.mock.calls[0][2]).toEqual({
        jobId: 'pdf-another-report',
      });
    });
  });

  describe('generateExcel', () => {
    it('should enqueue a GENERATE_EXCEL job with an excel prefixed job id', async () => {
      // WHEN
      const result = await service.generateExcel(job);

      // THEN
      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
      expect(mockQueueAdd).toHaveBeenCalledWith(
        REPORT_JOBS.GENERATE_EXCEL,
        job,
        { jobId: 'excel-report-123' },
      );
      expect(result).toEqual({ id: 'enqueued-job' });
    });
  });

  it('should build distinct job ids for the same report id across formats', async () => {
    // WHEN
    await service.generatePdf(job);
    await service.generateExcel(job);

    // THEN
    expect(mockQueueAdd.mock.calls[0][2].jobId).toBe('pdf-report-123');
    expect(mockQueueAdd.mock.calls[1][2].jobId).toBe('excel-report-123');
  });
});
