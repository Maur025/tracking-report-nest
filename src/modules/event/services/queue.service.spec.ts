import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { ReportProducer } from '../../../report-management/queue/report-producer.js';
import { ReportRequestService } from '../../../report-management/services/report-request.service.js';
import { EnterpriseConfigService } from '../../enterprise/enterprise-config.service.js';
import { EventReportQueryParams } from '../dto/event-report-query-params.js';
import { QueueService } from './queue.service.js';

describe('QueueService', () => {
  let service: QueueService;

  let mockGeneratePdf: Mock;
  let mockGenerateExcel: Mock;
  let mockCreate: Mock;
  let mockFindByDatabaseNameThrow: Mock;

  const reportRequest = { id: 'report-123' };

  const buildRequest = (
    overrides: Partial<EventReportQueryParams> = {},
  ): EventReportQueryParams =>
    ({
      databaseName: 'enterprise_1_db',
      format: 'excel',
      ...overrides,
    }) as EventReportQueryParams;

  beforeEach(async () => {
    mockGeneratePdf = vi.fn().mockResolvedValue({ id: 'job-pdf' });
    mockGenerateExcel = vi.fn().mockResolvedValue({ id: 'job-excel' });
    mockCreate = vi.fn().mockResolvedValue(reportRequest);
    mockFindByDatabaseNameThrow = vi.fn().mockResolvedValue({ id: 'config-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: ReportProducer,
          useValue: {
            generatePdf: mockGeneratePdf,
            generateExcel: mockGenerateExcel,
          },
        },
        {
          provide: ReportRequestService,
          useValue: { create: mockCreate },
        },
        {
          provide: EnterpriseConfigService,
          useValue: {
            findByDatabaseNameThrow: mockFindByDatabaseNameThrow,
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addReportToQueue', () => {
    it('should validate the enterprise before creating the report request', async () => {
      // GIVEN
      const request = buildRequest();

      // WHEN
      await service.addReportToQueue(request);

      // THEN
      expect(mockFindByDatabaseNameThrow).toHaveBeenCalledWith({
        databaseName: 'enterprise_1_db',
      });
      expect(mockFindByDatabaseNameThrow.mock.invocationCallOrder[0]).toBeLessThan(
        mockCreate.mock.invocationCallOrder[0],
      );
    });

    it('should create the report request with the event type and the original payload', async () => {
      // GIVEN
      const request = buildRequest({ title: 'Reporte de eventos' });

      // WHEN
      await service.addReportToQueue(request);

      // THEN
      expect(mockCreate).toHaveBeenCalledWith({
        type: ReportTypeEnum.EVENT,
        payload: request,
      });
    });

    it('should enqueue a pdf job when the format is pdf', async () => {
      // GIVEN
      const request = buildRequest({ format: 'pdf' });

      // WHEN
      const result = await service.addReportToQueue(request);

      // THEN
      expect(mockGeneratePdf).toHaveBeenCalledWith({
        reportId: reportRequest.id,
      });
      expect(mockGenerateExcel).not.toHaveBeenCalled();
      expect(result).toEqual({ reportRequestId: reportRequest.id });
    });

    it('should enqueue an excel job when the format is not pdf', async () => {
      // GIVEN
      const request = buildRequest({ format: 'excel' });

      // WHEN
      const result = await service.addReportToQueue(request);

      // THEN
      expect(mockGenerateExcel).toHaveBeenCalledWith({
        reportId: reportRequest.id,
      });
      expect(mockGeneratePdf).not.toHaveBeenCalled();
      expect(result).toEqual({ reportRequestId: reportRequest.id });
    });

    it('should not create the report request when the enterprise does not exist', async () => {
      // GIVEN
      mockFindByDatabaseNameThrow.mockRejectedValue(
        new Error('Enterprise not found'),
      );

      // WHEN / THEN
      await expect(service.addReportToQueue(buildRequest())).rejects.toThrow(
        'Enterprise not found',
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockGenerateExcel).not.toHaveBeenCalled();
    });
  });
});
