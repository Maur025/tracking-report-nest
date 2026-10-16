import { Temporal } from '@js-temporal/polyfill';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ExcelReportService } from '../../report-generator/services/excel-report.service.js';
import { PdfReportService } from '../../report-generator/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import type { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import { EventReportQueryParams } from './dto/event-report-query-params.js';
import { EventClientService } from './event-client.service.js';
import { EventService } from './event.service.js';

const enterpriseConfig = {
  database: 'tracking_db',
  hostUrl: 'http://enterprise-host:8080',
} as EnterpriseConfig;

const emptyStream = () => (async function* () {})();

describe('EventService', () => {
  let service: EventService;
  let mockPdfGenerate: Mock;
  let mockExcelGenerate: Mock;
  let mockFindByDatabaseNameThrow: Mock;
  let mockGetEventReportDataStream: Mock;

  beforeEach(async () => {
    mockPdfGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockExcelGenerate = vi.fn().mockReturnValue(new PassThrough());
    mockFindByDatabaseNameThrow = vi.fn().mockResolvedValue(enterpriseConfig);
    mockGetEventReportDataStream = vi.fn().mockImplementation(emptyStream);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventClientService,
          useValue: { getEventReportDataStream: mockGetEventReportDataStream },
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

    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve the enterprise config by database name', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
    } as EventReportQueryParams);

    // THEN
    expect(mockFindByDatabaseNameThrow).toHaveBeenCalledWith({
      databaseName: 'tracking_db',
    });
  });

  it('should generate an excel report by default', async () => {
    // WHEN
    const result = await service.generateReportStream({
      databaseName: 'tracking_db',
      title: 'Reporte de eventos',
      filterByLabel: 'Hoy',
    } as EventReportQueryParams);

    // THEN
    expect(result).toBeInstanceOf(PassThrough);
    expect(mockExcelGenerate).toHaveBeenCalledTimes(1);
    expect(mockPdfGenerate).not.toHaveBeenCalled();
    expect(mockExcelGenerate.mock.calls[0][0]).toMatchObject({
      sheetName: 'EventReport',
      font: 'Arial',
    });
    expect(mockExcelGenerate.mock.calls[0][0].sheetHeader.title.value).toBe(
      'Reporte de eventos',
    );
  });

  it('should generate a pdf report when the format is pdf', async () => {
    // WHEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      title: 'Reporte de eventos',
    } as EventReportQueryParams);

    // THEN
    expect(mockPdfGenerate).toHaveBeenCalledTimes(1);
    expect(mockExcelGenerate).not.toHaveBeenCalled();
    expect(mockPdfGenerate.mock.calls[0][0].mainTitle).toBe(
      'Reporte de eventos',
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
      vehicleId: 'v-1',
      type: 'SENSORS',
    } as EventReportQueryParams);

    const reportParams = mockExcelGenerate.mock.calls[0][0];
    await reportParams.dataSource();

    // THEN
    expect(mockGetEventReportDataStream).toHaveBeenCalledWith(
      expect.objectContaining({
        dbName: 'tracking_db',
        dbHost: 'http://enterprise-host:8080',
        filters: expect.objectContaining({
          vehicleId: 'v-1',
          type: 'SENSORS',
          fromDate: expect.any(Number),
          toDate: expect.any(Number),
        }),
      }),
    );
  });

  it('should build each excel row from the event values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      zoneId: 'UTC',
    } as EventReportQueryParams);
    const reportParams = mockExcelGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.rows(
      {
        eventName: 'GEOFENCES',
        inout: 'in',
        geofence: 'Zona Norte',
        vehicles: 'Tucson',
        rule: 'Regla X',
        date: 1672531200000,
      },
      3,
    );

    // THEN
    expect(row[0].value).toBe(3);
    expect(row[1].value).toBe('01/01/2023, 00:00');
    expect(row[2].value).toBe('Geocerca');
    expect(row[3].value).toBe('Regla X');
    expect(row[4].value).toBe('Tucson');
    expect(row[5].value).toContain('Zona Norte');
  });

  it('should build each pdf column from the event values', async () => {
    // GIVEN
    await service.generateReportStream({
      databaseName: 'tracking_db',
      format: 'pdf',
      zoneId: 'UTC',
    } as EventReportQueryParams);
    const reportParams = mockPdfGenerate.mock.calls[0][0];

    // WHEN
    const row = reportParams.table.columnRows(
      {
        eventName: 'SENSORS',
        devent: 'Temperatura',
        conditionOperator: '>',
        conditionValue: '30',
        value: '35',
        vehicles: 'Tucson',
        rule: 'Regla X',
        date: 1672531200000,
      },
      0,
    );

    // THEN
    expect(row[0].text).toBe('0');
    expect(row[1].text).toBe('01/01/2023, 00:00');
    expect(row[2].text).toBe('Sensor');
    expect(row[5].text).toContain('35');
  });
});
