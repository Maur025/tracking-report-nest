import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { PassThrough } from 'node:stream';
import path from 'node:path';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { GenerateReportJob } from '../infrastructure/queue/queue-values.js';
import { ReportStatusEnum } from '../report-management/enums/report-status.enum.js';
import { ReportRequest } from '../report-management/entities/report-request.entity.js';
import { ReportRequestService } from '../report-management/services/report-request.service.js';
import { saveStreamToFile } from '../shared/utils/save-stream-file.js';
import { ReportConsumer } from './report-consumer.js';
import { ReportGenerateStrategyService } from './report-generate-strategy.service.js';

vi.mock('../shared/utils/save-stream-file.js', () => ({
  saveStreamToFile: vi.fn().mockResolvedValue(undefined),
}));

describe('ReportConsumer', () => {
  let service: ReportConsumer;

  let mockGetOrThrow: Mock;
  let mockReportRequestUpdate: Mock;
  let mockReportRequestFindOneByIdThrow: Mock;
  let mockGetStrategy: Mock;
  let mockGenerate: Mock;

  const staticPath = '/tmp/tracking-report-static';

  const reportRequest = {
    id: 'report-123',
    type: 'event',
    payload: { databaseName: 'db' },
  } as ReportRequest;

  const buildJob = (name: string) =>
    ({ name, data: { reportId: 'report-123' } }) as Job<GenerateReportJob>;

  beforeEach(async () => {
    mockGetOrThrow = vi.fn().mockReturnValue(staticPath);
    mockReportRequestFindOneByIdThrow = vi
      .fn()
      .mockResolvedValue(reportRequest);
    mockReportRequestUpdate = vi.fn().mockResolvedValue(reportRequest);
    mockGenerate = vi.fn().mockResolvedValue(new PassThrough());
    mockGetStrategy = vi.fn().mockReturnValue({ generate: mockGenerate });

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
        {
          provide: ReportGenerateStrategyService,
          useValue: { getStrategy: mockGetStrategy },
        },
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

  it('should read the static path from the configuration', () => {
    expect(mockGetOrThrow).toHaveBeenCalledWith('APP_STATIC_PATH');
  });

  describe('process', () => {
    it('should mark the report as processing and complete it with the generated file', async () => {
      // GIVEN
      const job = buildJob('generate-pdf');

      // WHEN
      await service.process(job);

      // THEN
      expect(mockReportRequestFindOneByIdThrow).toHaveBeenCalledWith(
        'report-123',
      );
      expect(mockReportRequestUpdate).toHaveBeenNthCalledWith(
        1,
        'report-123',
        { status: ReportStatusEnum.PROCESSING },
      );
      expect(mockGetStrategy).toHaveBeenCalledWith('event');
      expect(mockGenerate).toHaveBeenCalledWith(reportRequest);
      expect(saveStreamToFile).toHaveBeenCalledWith(
        expect.any(PassThrough),
        path.join(staticPath, 'reports/pdf/report-report-123.pdf'),
      );
      expect(mockReportRequestUpdate).toHaveBeenNthCalledWith(
        2,
        'report-123',
        {
          status: ReportStatusEnum.COMPLETED,
          filePath: path.join('reports', 'pdf', 'report-report-123.pdf'),
        },
      );
    });

    it('should store excel reports under the excel directory', async () => {
      // GIVEN
      const job = buildJob('generate-excel');

      // WHEN
      await service.process(job);

      // THEN
      expect(saveStreamToFile).toHaveBeenCalledWith(
        expect.any(PassThrough),
        path.join(staticPath, 'reports/excel/report-report-123.xlsx'),
      );
      expect(mockReportRequestUpdate).toHaveBeenNthCalledWith(
        2,
        'report-123',
        {
          status: ReportStatusEnum.COMPLETED,
          filePath: path.join('reports', 'excel', 'report-report-123.xlsx'),
        },
      );
    });

    it('should mark the report as failed and rethrow when the generation fails', async () => {
      // GIVEN
      mockGenerate.mockRejectedValue(new Error('Generation exploded'));

      // WHEN / THEN
      await expect(service.process(buildJob('generate-pdf'))).rejects.toThrow(
        'Generation exploded',
      );
      expect(mockReportRequestUpdate).toHaveBeenNthCalledWith(
        2,
        'report-123',
        {
          status: ReportStatusEnum.FAILED,
          errorMessage: 'Generation exploded',
        },
      );
    });

    it('should report an unknown error when the failure is not an Error instance', async () => {
      // GIVEN
      mockGenerate.mockRejectedValue('boom');

      // WHEN / THEN
      await expect(service.process(buildJob('generate-pdf'))).rejects.toThrow(
        'boom',
      );
      expect(mockReportRequestUpdate).toHaveBeenNthCalledWith(
        2,
        'report-123',
        { status: ReportStatusEnum.FAILED, errorMessage: 'Unknown error' },
      );
    });

    it('should throw when the job name is unknown', async () => {
      // WHEN / THEN
      await expect(service.process(buildJob('generate-csv'))).rejects.toThrow(
        'Unknown job name: generate-csv',
      );
      expect(mockGenerate).not.toHaveBeenCalled();
    });

    it('should propagate the error when the report request cannot be found', async () => {
      // GIVEN
      mockReportRequestFindOneByIdThrow.mockRejectedValue(
        new Error('Report request not found'),
      );

      // WHEN / THEN
      await expect(service.process(buildJob('generate-pdf'))).rejects.toThrow(
        'Report request not found',
      );
      expect(mockGetStrategy).not.toHaveBeenCalled();
    });
  });
});
