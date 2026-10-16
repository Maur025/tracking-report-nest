import { Temporal } from '@js-temporal/polyfill';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ExcelReportService } from '../../report-generator/services/excel-report.service.js';
import { PdfReportService } from '../../report-generator/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import type { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import { RegistryProgressReportQueryParams } from './dto/registry-progress-report-query-params.js';
import { RegistryProgressClientService } from './registry-progress-client.service.js';
import { RegistryProgressService } from './registry-progress.service.js';

const enterpriseConfig = {
  database: 'tracking_db',
  hostUrl: 'http://enterprise-host:8080',
} as EnterpriseConfig;

const emptyStream = () => async function* () {};

describe('RegistryProgressService', () => {
  let service: RegistryProgressService;
  let mockPdfGenerate: Mock;
  let mockExcelGenerate: Mock;
  let mockFindByDatabaseNameThrow: Mock;
  let mockGetRegistryProgressReportDataStream: Mock;

  beforeEach(async () => {
    mockPdfGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockExcelGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockFindByDatabaseNameThrow = vi.fn().mockResolvedValue(enterpriseConfig);
    mockGetRegistryProgressReportDataStream = vi
      .fn()
      .mockImplementation(emptyStream);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryProgressService,
        {
          provide: RegistryProgressClientService,
          useValue: {
            getRegistryProgressReportDataStream:
              mockGetRegistryProgressReportDataStream,
          },
        },
        { provide: PdfReportService, useValue: { generate: mockPdfGenerate } },
        {
          provide: ExcelReportService,
          useValue: { generate: mockExcelGenerate },
        },
        {
          provide: EnterpriseConfigService,
          useValue: { findByDatabaseNameThrow: mockFindByDatabaseNameThrow },
        },
      ],
    }).compile();

    service = module.get<RegistryProgressService>(RegistryProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve the enterprise config by database name', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
    } as RegistryProgressReportQueryParams);

    // THEN
    expect(mockFindByDatabaseNameThrow).toHaveBeenCalledWith({
      databaseName: 'tracking_db',
    });
  });

  it('should generate an excel report by default', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      title: 'Reporte de registro',
    } as RegistryProgressReportQueryParams);

    // THEN
    expect(mockExcelGenerate).toHaveBeenCalledTimes(1);
    expect(mockPdfGenerate).not.toHaveBeenCalled();
    expect(mockExcelGenerate.mock.calls[0][0]).toMatchObject({
      sheetName: 'RegistryProgressReport',
      font: 'Arial',
    });
  });

  it('should generate a pdf report when the format is pdf', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      title: 'Reporte de registro',
    } as RegistryProgressReportQueryParams);

    // THEN
    expect(mockPdfGenerate).toHaveBeenCalledTimes(1);
    expect(mockExcelGenerate).not.toHaveBeenCalled();
    expect(mockPdfGenerate.mock.calls[0][0].mainTitle).toBe(
      'Reporte de registro',
    );
  });

  it('should wire the data source with the resolved host and filters', async () => {
    // GIVEN
    const fromDate = Temporal.Instant.from(
      '2023-01-01T00:00:00Z',
    ).toZonedDateTimeISO('UTC');
    const toDate = Temporal.Instant.from(
      '2023-01-31T00:00:00Z',
    ).toZonedDateTimeISO('UTC');

    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      fromDate,
      toDate,
      type: 'ROUTE',
      vehicleId: 'v-1',
      progressId: 'p-1',
    } as RegistryProgressReportQueryParams);
    await mockExcelGenerate.mock.calls[0][0].dataSource();

    // THEN
    expect(mockGetRegistryProgressReportDataStream).toHaveBeenCalledWith(
      expect.objectContaining({
        dbName: 'tracking_db',
        dbHost: 'http://enterprise-host:8080',
        filters: expect.objectContaining({
          type: 'ROUTE',
          vehicleId: 'v-1',
          progressId: 'p-1',
          fromDate: expect.any(Number),
          toDate: expect.any(Number),
        }),
      }),
    );
  });

  it('should build each excel row from the registry values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      zoneId: 'UTC',
    } as RegistryProgressReportQueryParams);
    const reportParams = mockExcelGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.rows(
      {
        type: 'ROUTE',
        vehicle: 'Tucson',
        progressName: 'Progreso semanal',
        progressFrequencyType: 'WEEKLY',
        progressValue: 42,
        dateFrom: 1672531200000,
        dateTo: 1672531200000,
      },
      0,
    );

    // THEN
    expect(row[0].value).toBe(0);
    expect(row[1].value).toBe('01/01/2023, 00:00');
    expect(row[3].value).toBe('Ruta');
    expect(row[4].value).toBe('Progreso semanal (Semanal)');
    expect(row[5].value).toBe('Tucson');
    expect(row[6].value).toBe(42);
  });

  it('should build each pdf column from the registry values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      zoneId: 'UTC',
    } as RegistryProgressReportQueryParams);
    const reportParams = mockPdfGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.columnRows(
      {
        type: 'ROUTE',
        vehicle: 'Tucson',
        progressName: 'Progreso semanal',
        progressFrequencyType: 'WEEKLY',
        progressValue: 42,
        dateFrom: 1672531200000,
        dateTo: 1672531200000,
      },
      0,
    );

    // THEN
    expect(row[0].text).toBe('0');
    expect(row[1].text).toBe('01/01/2023, 00:00');
    expect(row[4].text).toBe('Progreso semanal (Semanal)');
    expect(row[6].text).toBe('42 %');
  });
});
