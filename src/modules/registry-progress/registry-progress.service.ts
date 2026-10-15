import { Injectable } from '@nestjs/common';
import { ExcelReportService } from '../../report/services/excel-report.service.js';

import { PassThrough } from 'node:stream';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { getDateFilter } from '../../shared/utils/get-date-filter.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { EnterpriseConfig } from '../enterprise/entities/enterprise-config.entity.js';
import {
  getDate,
  getItemProgressName,
  getProgressValue,
  getTypeProgress,
  getVehicleName,
} from './common/registry-progress-report-common.js';
import { RegistryProgressReportQueryParams } from './dto/registry-progress-report-query-params.js';
import { RegistryProgressReportResponse } from './interfaces/registry-progress-report-response.interface.js';
import { RegistryProgressClientService } from './registry-progress-client.service.js';

@Injectable()
export class RegistryProgressService {
  constructor(
    private readonly registryProgressClientService: RegistryProgressClientService,
    private readonly pdfReportService: PdfReportService,
    private readonly excelReportService: ExcelReportService,
    private readonly enterpriseConfigService: EnterpriseConfigService,
  ) {}

  async generateReportStream(
    registryProgressReportQueryParams: RegistryProgressReportQueryParams,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { databaseName, format } = registryProgressReportQueryParams;

    const enterpriseConfig =
      await this.enterpriseConfigService.findByDatabaseNameThrow({
        databaseName,
      });

    if (format === 'pdf') {
      return this.handlePdf(
        enterpriseConfig,
        registryProgressReportQueryParams,
      );
    }

    return this.handleExcel(
      enterpriseConfig,
      registryProgressReportQueryParams,
    );
  }

  private handleExcel(
    enterpriseConfig: EnterpriseConfig,
    registryProgressReportQueryParams: RegistryProgressReportQueryParams,
  ): PassThrough {
    const { title, filterByLabel, zoneId } = registryProgressReportQueryParams;

    return this.excelReportService.generate({
      dataSource: this.getDataSource(
        enterpriseConfig,
        registryProgressReportQueryParams,
      ),
      sheetName: 'RegistryProgressReport',
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
          { value: 'Desde', width: 20 },
          { value: 'Hasta', width: 20 },
          { value: 'Tipo', width: 15 },
          { value: 'Nombre', width: 35 },
          { value: 'Vehículo', width: 30 },
          { value: 'Progreso (%)', width: 30 },
        ],
        rows: (item, index) => [
          { value: index },
          { value: getDate(item.dateFrom, zoneId) },
          { value: getDate(item.dateTo, zoneId) },
          { value: getTypeProgress(item.type) },
          {
            value: getItemProgressName(
              item.progressName,
              item.progressFrequencyType,
            ),
          },
          { value: getVehicleName(item.vehicle) },
          { value: item.progressValue ?? 0 },
        ],
      },
    });
  }

  private handlePdf(
    enterpriseConfig: EnterpriseConfig,
    registryProgressReportQueryParams: RegistryProgressReportQueryParams,
  ): PDFKit.PDFDocument {
    const { title, filterByLabel, zoneId } = registryProgressReportQueryParams;

    return this.pdfReportService.generate({
      dataSource: this.getDataSource(
        enterpriseConfig,
        registryProgressReportQueryParams,
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
        columnWidths: [30, 90, 90, 60, 90, 90, 60],
        columnHeaders: [
          { text: 'Nro', fontSize: 9, paddingX: 4 },
          { text: 'Desde', fontSize: 9, paddingX: 4 },
          { text: 'Hasta', fontSize: 9, paddingX: 4 },
          { text: 'Tipo', fontSize: 9, paddingX: 4 },
          { text: 'Nombre', fontSize: 9, paddingX: 4 },
          { text: 'Vehículo', fontSize: 9, paddingX: 4 },
          { text: 'Progreso', fontSize: 9, paddingX: 4 },
        ],
        columnRows: (item, index) => [
          { text: String(index), fontSize: 8, paddingX: 4 },
          { text: getDate(item.dateFrom, zoneId), fontSize: 8, paddingX: 4 },
          { text: getDate(item.dateTo, zoneId), fontSize: 8, paddingX: 4 },
          { text: getTypeProgress(item.type), fontSize: 8, paddingX: 4 },
          {
            text: getItemProgressName(
              item.progressName,
              item.progressFrequencyType,
            ),
            fontSize: 8,
            paddingX: 4,
          },
          { text: getVehicleName(item.vehicle), fontSize: 8, paddingX: 4 },
          {
            text: getProgressValue(item.progressValue),
            fontSize: 8,
            paddingX: 4,
          },
        ],
      },
    });
  }

  private getDataSource(
    enterpriseConfig: EnterpriseConfig,
    registryProgressReportQueryParams: RegistryProgressReportQueryParams,
  ): () => AsyncGenerator<RegistryProgressReportResponse, void, unknown> {
    const {
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
      sortBy,
      descending,
      type,
      vehicleId,
      progressId,
    } = registryProgressReportQueryParams;

    const dateFilters = getDateFilter({
      date,
      fromDate,
      toDate,
      monthDate,
      yearDate,
      zoneId,
    });

    return () =>
      this.registryProgressClientService.getRegistryProgressReportDataStream({
        dbName: enterpriseConfig.database,
        dbHost: enterpriseConfig.hostUrl,
        pagination: {
          sortBy,
          descending,
        },
        filters: {
          ...dateFilters,
          type,
          vehicleId,
          progressId,
        },
      });
  }
}
