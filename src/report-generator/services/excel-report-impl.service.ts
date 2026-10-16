import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { generateExcel } from '../excel/generate-excel.js';
import { tableReport } from '../excel/table-report.js';
import { TableReportParams } from '../interfaces/table-report-e.interface.js';
import { ExcelReportService } from './excel-report.service.js';

@Injectable()
export class ExcelReportServiceImpl extends ExcelReportService {
  generate<T>(params: TableReportParams<T>): PassThrough {
    const { stream, workbook } = generateExcel();

    const builderReport = tableReport<T>(params);

    builderReport({ workbook, stream });

    return stream;
  }
}
