import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ExcelReportService } from '../../report/services/excel-report.service.js';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { getDateFilter } from '../../shared/utils/get-date-filter.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import {
  getFrequencies,
  getRuleEvents,
  getRuleName,
  getRuleOperationalContext,
  getRuleScope,
} from './common/rules-report-common.js';
import { RulesReportQueryParams } from './dto/rules-report-query-params.js';
import { RulesReportResponse } from './interfaces/rules-report-response.interface.js';
import { RulesClientService } from './rules-client.service.js';

@Injectable()
export class RulesService {
  constructor(
    private readonly rulesClientService: RulesClientService,
    private readonly pdfReportService: PdfReportService,
    private readonly excelReportService: ExcelReportService,
    private readonly enterpriseConfigService: EnterpriseConfigService,
  ) {}

  async generateReportStream(
    rulesReportQueryParams: RulesReportQueryParams,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { databaseName, format } = rulesReportQueryParams;

    const enterpriseConfig =
      await this.enterpriseConfigService.findByDatabaseNameThrow({
        databaseName,
      });

    if (format === 'pdf') {
      return this.handlePdf(enterpriseConfig, rulesReportQueryParams);
    }

    return this.handleExcel(enterpriseConfig, rulesReportQueryParams);
  }

  private handleExcel(
    enterpriseConfig: EnterpriseConfig,
    rulesReportQueryParams: RulesReportQueryParams,
  ): PassThrough {
    const { title, filterByLabel, zoneId } = rulesReportQueryParams;

    return this.excelReportService.generate({
      dataSource: this.getDataSource(enterpriseConfig, rulesReportQueryParams),
      sheetName: 'RulesReport',
      font: 'Arial',
      zoneId,
      sheetHeader: {
        title: { value: title },
        username: { value: 'Usuario de prueba' },
        filterBy: { value: filterByLabel },
        enterpriseName: {
          value: enterpriseConfig.enterprise?.name,
          style: { font: { bold: true, size: 12 } },
        },
        enterpriseLogo: { value: enterpriseConfig.enterprise?.image },
      },
      table: {
        headers: [
          { value: 'Nro', width: 10 },
          { value: 'Nombre', width: 35 },
          { value: 'Frecuencia', width: 30 },
          { value: 'Eventos', width: 20 },
          { value: 'Alcance', width: 20 },
          { value: 'Contexto Operativo', width: 20 },
        ],
        rows: (item, index) => [
          { value: index },
          { value: getRuleName(item.name, item.type) },
          { value: getFrequencies(item.frequency, zoneId) },
          { value: getRuleEvents(item.alerts, item.notifications) },
          { value: getRuleScope(item.groups, item.vehicles) },
          {
            value: getRuleOperationalContext(
              item.geofences,
              item.interestPoints,
              item.sensors,
            ),
          },
        ],
      },
    });
  }

  private handlePdf(
    enterpriseConfig: EnterpriseConfig,
    rulesReportQueryParams: RulesReportQueryParams,
  ): PDFKit.PDFDocument {
    const { title, filterByLabel, zoneId } = rulesReportQueryParams;

    return this.pdfReportService.generate({
      dataSource: this.getDataSource(enterpriseConfig, rulesReportQueryParams),
      mainTitle: title,
      zoneId,
      pageHeader: {
        username: 'Usuario de prueba',
        filterBy: filterByLabel,
        enterpriseName: enterpriseConfig.enterprise?.name,
        enterpriseLogo: enterpriseConfig.enterprise?.image,
      },
      table: {
        columnWidths: [30, 110, 110, 80, 70, 90],
        columnHeaders: [
          { text: 'Nro', fontSize: 9, paddingX: 4 },
          { text: 'Nombre', fontSize: 9, paddingX: 4 },
          { text: 'Frecuencia', fontSize: 9, paddingX: 4 },
          { text: 'Eventos', fontSize: 9, paddingX: 4 },
          { text: 'Alcance', fontSize: 9, paddingX: 4 },
          { text: 'Contexto Operativo', fontSize: 9, paddingX: 4 },
        ],
        columnRows: (item, index) => [
          { text: String(index), fontSize: 8, paddingX: 4 },
          {
            text: getRuleName(item.name, item.type),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getFrequencies(item.frequency, zoneId),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getRuleEvents(item.alerts, item.notifications),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getRuleScope(item.groups, item.vehicles),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getRuleOperationalContext(
              item.geofences,
              item.interestPoints,
              item.sensors,
            ),
            fontSize: 8,
            paddingX: 4,
          },
        ],
      },
    });
  }

  private getDataSource(
    enterpriseConfig: EnterpriseConfig,
    rulesReportQueryParams: RulesReportQueryParams,
  ): () => AsyncGenerator<RulesReportResponse, void, unknown> {
    const {
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
      sortBy,
      descending,
    } = rulesReportQueryParams;

    const dateFilters = getDateFilter({
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
    });

    return () =>
      this.rulesClientService.getProgressReportDataStream({
        dbName: enterpriseConfig.database,
        dbHost: enterpriseConfig.hostUrl,
        pagination: {
          sortBy,
          descending,
        },
        filters: {
          ...dateFilters,
        },
      });
  }
}
