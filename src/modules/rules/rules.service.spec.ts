import { Temporal } from '@js-temporal/polyfill';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ExcelReportService } from '../../report-generator/services/excel-report.service.js';
import { PdfReportService } from '../../report-generator/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import type { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import { RulesReportQueryParams } from './dto/rules-report-query-params.js';
import { RulesClientService } from './rules-client.service.js';
import { RulesService } from './rules.service.js';

const enterpriseConfig = {
  database: 'tracking_db',
  hostUrl: 'http://enterprise-host:8080',
} as EnterpriseConfig;

const emptyStream = () => async function* () {};

describe('RulesService', () => {
  let service: RulesService;
  let mockPdfGenerate: Mock;
  let mockExcelGenerate: Mock;
  let mockFindByDatabaseNameThrow: Mock;
  let mockGetRulesReportDataStream: Mock;

  beforeEach(async () => {
    mockPdfGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockExcelGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockFindByDatabaseNameThrow = vi.fn().mockResolvedValue(enterpriseConfig);
    mockGetRulesReportDataStream = vi.fn().mockImplementation(emptyStream);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        {
          provide: RulesClientService,
          useValue: {
            getProgressReportDataStream: mockGetRulesReportDataStream,
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

    service = module.get<RulesService>(RulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve the enterprise config by database name', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
    } as RulesReportQueryParams);

    // THEN
    expect(mockFindByDatabaseNameThrow).toHaveBeenCalledWith({
      databaseName: 'tracking_db',
    });
  });

  it('should generate an excel report by default', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      title: 'Reporte de reglas',
    } as RulesReportQueryParams);

    // THEN
    expect(mockExcelGenerate).toHaveBeenCalledTimes(1);
    expect(mockPdfGenerate).not.toHaveBeenCalled();
    expect(mockExcelGenerate.mock.calls[0][0]).toMatchObject({
      sheetName: 'RulesReport',
      font: 'Arial',
    });
  });

  it('should generate a pdf report when the format is pdf', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      title: 'Reporte de reglas',
    } as RulesReportQueryParams);

    // THEN
    expect(mockPdfGenerate).toHaveBeenCalledTimes(1);
    expect(mockExcelGenerate).not.toHaveBeenCalled();
    expect(mockPdfGenerate.mock.calls[0][0].mainTitle).toBe(
      'Reporte de reglas',
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
      type: 'SENSORS',
      frequencyWeekday: 1,
    } as RulesReportQueryParams);
    await mockExcelGenerate.mock.calls[0][0].dataSource();

    // THEN
    expect(mockGetRulesReportDataStream).toHaveBeenCalledWith(
      expect.objectContaining({
        dbName: 'tracking_db',
        dbHost: 'http://enterprise-host:8080',
        filters: expect.objectContaining({
          type: 'SENSORS',
          frequencyWeekday: 1,
          fromDate: expect.any(Number),
          toDate: expect.any(Number),
        }),
      }),
    );
  });

  it('should build each excel row from the rule values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      zoneId: 'UTC',
    } as RulesReportQueryParams);
    const reportParams = mockExcelGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.rows(
      {
        name: 'Exceso de velocidad',
        type: 'SENSORS',
        alerts: ['a', 'b'],
        notifications: [{ id: 'n1' }],
        vehicles: [1],
        groups: [1],
        frequency: [],
        geofences: [1],
        interestPoints: [1, 2],
        sensors: [1, 2, 3],
      },
      2,
    );

    // THEN
    expect(row[0].value).toBe(2);
    expect(row[1].value).toBe('Exceso de velocidad (Sensor)');
    expect(row[2].value).toBe('N/A');
    expect(row[3].value).toBe('Alertas: 2\nNotificaciones: 1');
    expect(row[5].value).toContain('Sensores: 3');
  });

  it('should build each pdf column from the rule values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      zoneId: 'UTC',
    } as RulesReportQueryParams);
    const reportParams = mockPdfGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.columnRows(
      {
        name: 'Exceso de velocidad',
        type: 'SENSORS',
        alerts: ['a', 'b'],
        notifications: [{ id: 'n1' }],
        vehicles: [1],
        groups: [1],
        frequency: [],
        geofences: [1],
        interestPoints: [1, 2],
        sensors: [1, 2, 3],
      },
      2,
    );

    // THEN
    expect(row[0].text).toBe('2');
    expect(row[1].text).toBe('Exceso de velocidad (Sensor)');
    expect(row[3].text).toBe('Alertas: 2\nNotificaciones: 1');
    expect(row[5].text).toContain('Sensores: 3');
  });
});
