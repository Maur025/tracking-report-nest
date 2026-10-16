import { Temporal } from '@js-temporal/polyfill';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ExcelReportService } from '../../report-generator/services/excel-report.service.js';
import { PdfReportService } from '../../report-generator/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import type { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import { ProgressReportQueryParams } from './dto/progress-report-query-params.js';
import { ProgressClientService } from './progress-client.service.js';
import { ProgressService } from './progress.service.js';

const enterpriseConfig = {
  database: 'tracking_db',
  hostUrl: 'http://enterprise-host:8080',
} as EnterpriseConfig;

const emptyStream = () => (async function* () {})();

describe('ProgressService', () => {
  let service: ProgressService;
  let mockPdfGenerate: Mock;
  let mockExcelGenerate: Mock;
  let mockFindByDatabaseNameThrow: Mock;
  let mockGetProgressReportDataStream: Mock;

  beforeEach(async () => {
    mockPdfGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockExcelGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockFindByDatabaseNameThrow = vi.fn().mockResolvedValue(enterpriseConfig);
    mockGetProgressReportDataStream = vi.fn().mockImplementation(emptyStream);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: ProgressClientService,
          useValue: {
            getProgressReportDataStream: mockGetProgressReportDataStream,
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

    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve the enterprise config by database name', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
    } as ProgressReportQueryParams);

    // THEN
    expect(mockFindByDatabaseNameThrow).toHaveBeenCalledWith({
      databaseName: 'tracking_db',
    });
  });

  it('should generate an excel report by default', async () => {
    // WHEN
    const result = await service.generateReportStream({
      databaseName: 'tracking_db',
      title: 'Reporte de progreso',
    } as ProgressReportQueryParams);

    // THEN
    expect(result).toBeInstanceOf(PassThrough);
    expect(mockExcelGenerate).toHaveBeenCalledTimes(1);
    expect(mockPdfGenerate).not.toHaveBeenCalled();
    expect(mockExcelGenerate.mock.calls[0][0]).toMatchObject({
      sheetName: 'ProgressReport',
      font: 'Arial',
    });
  });

  it('should generate a pdf report when the format is pdf', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      title: 'Reporte de progreso',
    } as ProgressReportQueryParams);

    // THEN
    expect(mockPdfGenerate).toHaveBeenCalledTimes(1);
    expect(mockExcelGenerate).not.toHaveBeenCalled();
    expect(mockPdfGenerate.mock.calls[0][0].mainTitle).toBe(
      'Reporte de progreso',
    );
  });

  it('should wire the data source with the resolved host and date filters', async () => {
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
    } as ProgressReportQueryParams);
    await mockExcelGenerate.mock.calls[0][0].dataSource();

    // THEN
    expect(mockGetProgressReportDataStream).toHaveBeenCalledWith(
      expect.objectContaining({
        dbName: 'tracking_db',
        dbHost: 'http://enterprise-host:8080',
        filters: expect.objectContaining({
          fromDate: expect.any(Number),
          toDate: expect.any(Number),
        }),
      }),
    );
  });

  it('should build each excel row from the progress values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      zoneId: 'UTC',
    } as ProgressReportQueryParams);
    const reportParams = mockExcelGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.rows(
      {
        name: 'Ruta escolar',
        type: 'ROUTE',
        frequencyType: 'DIARY',
        frequencies: [],
        groups: [1],
        vehicles: [1, 2],
        records: [1, 2, 3],
      },
      1,
    );

    // THEN
    expect(row[0].value).toBe(1);
    expect(row[1].value).toBe('Ruta escolar (Ruta, Diario)');
    expect(row[2].value).toBe('N/A');
    expect(row[3].value).toContain('Grupos: 1');
    expect(row[5].value).toBe('3');
  });

  it('should build each pdf column from the progress values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      zoneId: 'UTC',
    } as ProgressReportQueryParams);
    const reportParams = mockPdfGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.columnRows(
      {
        name: 'Ruta escolar',
        type: 'ROUTE',
        frequencyType: 'DIARY',
        frequencies: [],
        groups: [1],
        vehicles: [1, 2],
        records: [1, 2, 3],
      },
      1,
    );

    // THEN
    expect(row[0].text).toBe('1');
    expect(row[1].text).toBe('Ruta escolar (Ruta, Diario)');
    expect(row[2].text).toBe('N/A');
    expect(row[5].text).toBe('3');
  });
});
