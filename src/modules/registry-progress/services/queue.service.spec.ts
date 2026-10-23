import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { RegistryProgressReportQueryParams } from '../dto/registry-progress-report-query-params.js';
import { ReportProducer } from '../../../report-management/queue/report-producer.js';
import { ReportRequestService } from '../../../report-management/services/report-request.service.js';
import { EnterpriseConfigService } from '../../enterprise/enterprise-config.service.js';
import { QueueService } from './queue.service.js';

describe('QueueService', () => {
  let service: QueueService;

  let producer: {
    generatePdf: ReturnType<typeof vi.fn>;
    generateExcel: ReturnType<typeof vi.fn>;
  };
  let requests: { create: ReturnType<typeof vi.fn> };
  let enterprises: { findByDatabaseNameThrow: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    producer = {
      generatePdf: vi.fn().mockResolvedValue(undefined),
      generateExcel: vi.fn().mockResolvedValue(undefined),
    };
    requests = { create: vi.fn().mockResolvedValue({ id: 'report-1' }) };
    enterprises = { findByDatabaseNameThrow: vi.fn().mockResolvedValue({}) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: ReportProducer, useValue: producer },
        { provide: ReportRequestService, useValue: requests },
        { provide: EnterpriseConfigService, useValue: enterprises },
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
      } as RegistryProgressReportQueryParams;
      const selected =
        format === 'pdf' ? producer.generatePdf : producer.generateExcel;
      const other =
        format === 'pdf' ? producer.generateExcel : producer.generatePdf;

      const result = await service.addReportToQueue(request);

      expect(
        enterprises.findByDatabaseNameThrow,
      ).toHaveBeenCalledExactlyOnceWith({ databaseName: request.databaseName });
      expect(
        enterprises.findByDatabaseNameThrow.mock.invocationCallOrder[0],
      ).toBeLessThan(requests.create.mock.invocationCallOrder[0]);
      expect(requests.create.mock.invocationCallOrder[0]).toBeLessThan(
        selected.mock.invocationCallOrder[0],
      );
      expect(requests.create).toHaveBeenCalledExactlyOnceWith({
        type: ReportTypeEnum.REGISTRY_PROGRESS,
        payload: request,
      });
      expect(requests.create.mock.calls[0][0].payload).toBe(request);
      expect(selected).toHaveBeenCalledExactlyOnceWith({
        reportId: 'report-1',
      });
      expect(other).not.toHaveBeenCalled();
      expect(result).toEqual({ reportRequestId: 'report-1' });
    },
  );

  it('should stop before creating or enqueueing when the enterprise lookup fails', async () => {
    const error = new Error('Enterprise not found');
    enterprises.findByDatabaseNameThrow.mockRejectedValue(error);

    await expect(
      service.addReportToQueue({
        databaseName: 'missing',
        format: 'pdf',
      } as RegistryProgressReportQueryParams),
    ).rejects.toBe(error);

    expect(requests.create).not.toHaveBeenCalled();
    expect(producer.generatePdf).not.toHaveBeenCalled();
    expect(producer.generateExcel).not.toHaveBeenCalled();
  });

  it('should stop before enqueueing when creating the request fails', async () => {
    const error = new Error('Request creation failed');
    requests.create.mockRejectedValue(error);

    await expect(
      service.addReportToQueue({
        databaseName: 'enterprise_db',
        format: 'pdf',
      } as RegistryProgressReportQueryParams),
    ).rejects.toBe(error);

    expect(enterprises.findByDatabaseNameThrow).toHaveBeenCalledExactlyOnceWith(
      { databaseName: 'enterprise_db' },
    );
    expect(producer.generatePdf).not.toHaveBeenCalled();
    expect(producer.generateExcel).not.toHaveBeenCalled();
  });

  it.each(['pdf', 'excel'] as const)(
    'should propagate a %s producer failure without using the other producer',
    async (format) => {
      const error = new Error('Enqueue failed');
      const selected =
        format === 'pdf' ? producer.generatePdf : producer.generateExcel;
      const other =
        format === 'pdf' ? producer.generateExcel : producer.generatePdf;
      selected.mockRejectedValue(error);

      await expect(
        service.addReportToQueue({
          databaseName: 'enterprise_db',
          format,
        } as RegistryProgressReportQueryParams),
      ).rejects.toBe(error);

      expect(requests.create).toHaveBeenCalledTimes(1);
      expect(selected).toHaveBeenCalledExactlyOnceWith({
        reportId: 'report-1',
      });
      expect(other).not.toHaveBeenCalled();
    },
  );
});
