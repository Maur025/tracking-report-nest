import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { RulesReportQueryParams } from '../dto/rules-report-query-params.js';
import { ReportProducer } from '../../../report-management/queue/report-producer.js';
import { ReportRequestService } from '../../../report-management/services/report-request.service.js';
import { EnterpriseConfigService } from '../../enterprise/enterprise-config.service.js';
import { QueueService } from './queue.service.js';

describe('QueueService', () => {
  let service: QueueService;

  let mockGeneratePdf: ReturnType<typeof vi.fn>;
  let mockGenerateExcel: ReturnType<typeof vi.fn>;
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockFindByDatabaseNameThrow: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockGeneratePdf = vi.fn().mockResolvedValue(undefined);
    mockGenerateExcel = vi.fn().mockResolvedValue(undefined);
    mockCreate = vi.fn().mockResolvedValue({ id: 'report-1' });
    mockFindByDatabaseNameThrow = vi.fn().mockResolvedValue({});
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
        { provide: ReportRequestService, useValue: { create: mockCreate } },
        {
          provide: EnterpriseConfigService,
          useValue: { findByDatabaseNameThrow: mockFindByDatabaseNameThrow },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each(['pdf', 'excel'] as const)(
    'should validate, create and enqueue a %s report in order',
    async (format) => {
      const request = {
        databaseName: 'enterprise_db',
        format,
      } as RulesReportQueryParams;
      const selected = format === 'pdf' ? mockGeneratePdf : mockGenerateExcel;
      const other = format === 'pdf' ? mockGenerateExcel : mockGeneratePdf;

      const result = await service.addReportToQueue(request);

      expect(mockFindByDatabaseNameThrow).toHaveBeenCalledExactlyOnceWith({
        databaseName: request.databaseName,
      });
      expect(
        mockFindByDatabaseNameThrow.mock.invocationCallOrder[0],
      ).toBeLessThan(mockCreate.mock.invocationCallOrder[0]);
      expect(mockCreate.mock.invocationCallOrder[0]).toBeLessThan(
        selected.mock.invocationCallOrder[0],
      );
      expect(mockCreate).toHaveBeenCalledExactlyOnceWith({
        type: ReportTypeEnum.RULES,
        payload: request,
      });
      expect(mockCreate.mock.calls[0][0].payload).toBe(request);
      expect(selected).toHaveBeenCalledExactlyOnceWith({
        reportId: 'report-1',
      });
      expect(other).not.toHaveBeenCalled();
      expect(result).toEqual({ reportRequestId: 'report-1' });
    },
  );

  it('should stop before creating or enqueueing when the enterprise lookup fails', async () => {
    const error = new Error('Enterprise not found');
    mockFindByDatabaseNameThrow.mockRejectedValue(error);

    await expect(
      service.addReportToQueue({
        databaseName: 'missing',
        format: 'pdf',
      } as RulesReportQueryParams),
    ).rejects.toBe(error);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockGeneratePdf).not.toHaveBeenCalled();
    expect(mockGenerateExcel).not.toHaveBeenCalled();
  });

  it('should stop before enqueueing when creating the request fails', async () => {
    const error = new Error('Request creation failed');
    mockCreate.mockRejectedValue(error);

    await expect(
      service.addReportToQueue({
        databaseName: 'enterprise_db',
        format: 'pdf',
      } as RulesReportQueryParams),
    ).rejects.toBe(error);

    expect(mockFindByDatabaseNameThrow).toHaveBeenCalledExactlyOnceWith({
      databaseName: 'enterprise_db',
    });
    expect(mockGeneratePdf).not.toHaveBeenCalled();
    expect(mockGenerateExcel).not.toHaveBeenCalled();
  });

  it.each(['pdf', 'excel'] as const)(
    'should propagate a %s producer failure without using the other producer',
    async (format) => {
      const error = new Error('Enqueue failed');
      const selected = format === 'pdf' ? mockGeneratePdf : mockGenerateExcel;
      const other = format === 'pdf' ? mockGenerateExcel : mockGeneratePdf;
      selected.mockRejectedValue(error);

      await expect(
        service.addReportToQueue({
          databaseName: 'enterprise_db',
          format,
        } as RulesReportQueryParams),
      ).rejects.toBe(error);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(selected).toHaveBeenCalledExactlyOnceWith({
        reportId: 'report-1',
      });
      expect(other).not.toHaveBeenCalled();
    },
  );
});
