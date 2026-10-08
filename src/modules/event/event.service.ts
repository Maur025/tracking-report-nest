import { Injectable } from '@nestjs/common';
import { ExcelReportService } from '../../report/services/excel-report.service.js';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { formatDateOfTimestamp } from '../../shared/utils/format-date-of-timestamp.js';
import { getDateFilter } from '../../shared/utils/get-date-filter.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import type { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import { getEventValues } from './common/event-report-common.js';
import { EventReportQueryParams } from './dto/event-report-query-params.js';
import { EventClientService } from './event-client.service.js';
import { EventReportResponse } from './interfaces/event-report-response.interface.js';

@Injectable()
export class EventService {
  constructor(
    private readonly pdfReportService: PdfReportService,
    private readonly excelReportService: ExcelReportService,
    private readonly eventClientService: EventClientService,
    private readonly enterpriseConfigService: EnterpriseConfigService,
  ) {}

  findAll() {
    return `This action returns all event`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  async generateReportStream(eventReportQueryParams: EventReportQueryParams) {
    const { databaseName, format } = eventReportQueryParams;

    const enterpriseConfig =
      await this.enterpriseConfigService.findByDatabaseNameThrow({
        databaseName,
      });

    if (format === 'pdf') {
      return this.handlePdf(enterpriseConfig, eventReportQueryParams);
    }

    if (format === 'excel') {
      return this.handleExcel(enterpriseConfig, eventReportQueryParams);
    }
  }

  private handleExcel(
    enterpriseConfig: EnterpriseConfig,
    eventReportQueryParams: EventReportQueryParams,
  ) {
    const { title, filterByLabel, zoneId } = eventReportQueryParams;

    return this.excelReportService.generate({
      dataSource: this.getDataSource(enterpriseConfig, eventReportQueryParams),
      sheetName: 'EventReport',
      font: 'Arial',
      zoneId,
      sheetHeader: {
        title: { value: title },
        username: { value: 'Usuario de prueba' },
        filterBy: { value: filterByLabel },
        enterpriseName: {
          value: enterpriseConfig.enterprise.name,
          style: { font: { bold: true, size: 12 } },
        },
        enterpriseLogo: { value: enterpriseConfig.enterprise.image },
      },
      table: {
        headers: [
          { value: 'Nro', width: 10 },
          { value: 'Fecha', width: 20 },
          { value: 'Tipo', width: 15 },
          { value: 'Regla', width: 40 },
          { value: 'Vehículo', width: 30 },
          { value: 'Evento', width: 60 },
        ],
        rows: (item, index) => {
          const { eventName, eventDetail } = getEventValues(item);
          const formattedDate = formatDateOfTimestamp({
            timestamp: item.date,
            zoneId,
          });

          return [
            { value: index },
            { value: formattedDate },
            { value: eventName },
            { value: item.rule },
            { value: item.vehicles },
            { value: eventDetail },
          ];
        },
      },
    });
  }

  private handlePdf(
    enterpriseConfig: EnterpriseConfig,
    eventReportQueryParams: EventReportQueryParams,
  ) {
    const { title, filterByLabel, zoneId } = eventReportQueryParams;

    return this.pdfReportService.generate({
      dataSource: this.getDataSource(enterpriseConfig, eventReportQueryParams),
      mainTitle: title,
      pageHeader: {
        username: 'Usuario de prueba',
        filterBy: filterByLabel,
        enterpriseName: enterpriseConfig.enterprise?.name,
        enterpriseLogo: enterpriseConfig.enterprise?.image,
      },
      table: {
        columnWidths: [30, 90, 70, 110, 80, 110],
        columnHeaders: [
          { text: 'Nro', fontSize: 9, paddingX: 4 },
          { text: 'Fecha', fontSize: 9, paddingX: 4 },
          { text: 'Tipo', fontSize: 9, paddingX: 4 },
          { text: 'Regla', fontSize: 9, paddingX: 4 },
          { text: 'Vehículo', fontSize: 9, paddingX: 4 },
          { text: 'Evento', fontSize: 9, paddingX: 4 },
        ],
        columnRows: (item, index) => {
          const { eventName, eventDetail } = getEventValues(item);
          const formattedDate = formatDateOfTimestamp({
            timestamp: item.date,
            zoneId,
          });

          return [
            { text: String(index), fontSize: 8, paddingX: 4 },
            { text: formattedDate, fontSize: 8, paddingX: 4 },
            { text: eventName, fontSize: 8, paddingX: 4 },
            { text: item.rule, fontSize: 8, paddingX: 4 },
            { text: item.vehicles, fontSize: 8, paddingX: 4 },
            { text: eventDetail, fontSize: 8, paddingX: 4 },
          ];
        },
      },
      zoneId,
    });
  }

  private getDataSource(
    enterpriseConfig: EnterpriseConfig,
    eventReportQueryParams: EventReportQueryParams,
  ): () => AsyncGenerator<EventReportResponse, void, unknown> {
    const {
      sortBy,
      descending,
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
      vehicleId,
      ruleId,
      inout,
      geofenceId,
      type,
      deventId,
    } = eventReportQueryParams;

    const dateFilters = getDateFilter({
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
    });

    return () =>
      this.eventClientService.getEventReportDataStream({
        dbName: enterpriseConfig.database,
        dbHost: enterpriseConfig.hostUrl,
        pagination: {
          sortBy,
          descending,
        },
        filters: {
          vehicleId,
          ruleId,
          inout,
          geofenceId,
          type,
          deventId,
          ...dateFilters,
        },
      });
  }
}
