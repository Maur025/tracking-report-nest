import { PassThrough } from 'node:stream';
import { TableReportParams } from '../interfaces/table-report-e.interface.js';

export abstract class ExcelReportService {
  abstract generate<T>(params: TableReportParams<T>): PassThrough;
}
