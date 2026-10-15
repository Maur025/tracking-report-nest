import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ExcelReportService } from '../../report/services/excel-report.service.js';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { getDateFilter } from '../../shared/utils/get-date-filter.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import {
  getFrequencies,
  getProgressName,
  getProgressOperationalContext,
  getProgressRecords,
  getProgressScope,
} from './common/progress-report-common.js';
import { ProgressReportQueryParams } from './dto/progress-report-query-params.js';
import { ProgressReportResponse } from './interfaces/progress-report-response.interface.js';
import { ProgressClientService } from './progress-client.service.js';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressClientService: ProgressClientService,
    private readonly pdfReportService: PdfReportService,
    private readonly excelReportService: ExcelReportService,
    private readonly enterpriseConfigService: EnterpriseConfigService,
  ) {}

  async generateReportStream(
    progressReportQueryParams: ProgressReportQueryParams,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { databaseName, format } = progressReportQueryParams;

    const enterpriseConfig =
      await this.enterpriseConfigService.findByDatabaseNameThrow({
        databaseName,
      });

    if (format === 'pdf') {
      return this.handlePdf(enterpriseConfig, progressReportQueryParams);
    }

    return this.handleExcel(enterpriseConfig, progressReportQueryParams);
  }

  private handleExcel(
    enterpriseConfig: EnterpriseConfig,
    progressReportQueryParams: ProgressReportQueryParams,
  ): PassThrough {
    const { title, filterByLabel, zoneId } = progressReportQueryParams;

    return this.excelReportService.generate({
      dataSource: this.getDataSource(
        enterpriseConfig,
        progressReportQueryParams,
      ),
      sheetName: 'ProgressReport',
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
          { value: 'Alcance', width: 20 },
          { value: 'Contexto Operativo', width: 20 },
          { value: 'Registros', width: 15 },
        ],
        rows: (item, index) => [
          { value: index },
          { value: getProgressName(item.name, item.type, item.frequencyType) },
          { value: getFrequencies(item.frequencies, zoneId) },
          { value: getProgressScope(item.groups, item.vehicles) },
          {
            value: getProgressOperationalContext(
              item.route,
              item.geofences,
              item.interestPoints,
            ),
          },
          { value: getProgressRecords(item.records) },
        ],
      },
    });
  }

  private handlePdf(
    enterpriseConfig: EnterpriseConfig,
    progressReportQueryParams: ProgressReportQueryParams,
  ): PDFKit.PDFDocument {
    const { title, filterByLabel, zoneId } = progressReportQueryParams;

    return this.pdfReportService.generate({
      dataSource: this.getDataSource(
        enterpriseConfig,
        progressReportQueryParams,
      ),
      mainTitle: title,
      zoneId,
      pageHeader: {
        username: 'Usuario de prueba',
        filterBy: filterByLabel,
        enterpriseName: enterpriseConfig.enterprise?.name,
        enterpriseLogo: enterpriseConfig.enterprise?.image,
      },
      table: {
        columnWidths: [30, 110, 110, 70, 110, 70],
        columnHeaders: [
          { text: 'Nro', fontSize: 9, paddingX: 4 },
          { text: 'Nombre', fontSize: 9, paddingX: 4 },
          { text: 'Frecuencia', fontSize: 9, paddingX: 4 },
          { text: 'Alcance', fontSize: 9, paddingX: 4 },
          { text: 'Contexto Operativo', fontSize: 9, paddingX: 4 },
          { text: 'Registros', fontSize: 9, paddingX: 4 },
        ],
        columnRows: (item, index) => [
          { text: String(index), fontSize: 8, paddingX: 4 },
          {
            text: getProgressName(item.name, item.type, item.frequencyType),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getFrequencies(item.frequencies, zoneId),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getProgressScope(item.groups, item.vehicles),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getProgressOperationalContext(
              item.route,
              item.geofences,
              item.interestPoints,
            ),
            fontSize: 8,
            paddingX: 4,
          },
          {
            text: getProgressRecords(item.records),
            fontSize: 8,
            paddingX: 4,
          },
        ],
      },
    });
  }

  private getDataSource(
    enterpriseConfig: EnterpriseConfig,
    progressReportQueryParams: ProgressReportQueryParams,
  ): () => AsyncGenerator<ProgressReportResponse, void, unknown> {
    const {
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
      sortBy,
      descending,
    } = progressReportQueryParams;

    const dateFilters = getDateFilter({
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
    });

    return () =>
      this.progressClientService.getProgressReportDataStream({
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
