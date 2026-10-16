import ExcelJS from 'exceljs';
import type { PassThrough } from 'node:stream';

export type ExcelFont = 'Inter' | 'Arial';

export interface GenerateExcelResponse {
  stream: PassThrough;
  workbook: ExcelJS.stream.xlsx.WorkbookWriter;
  closeWorkbook?: () => Promise<void>;
}
