import ExcelJS, { Worksheet } from 'exceljs';
import { PassThrough } from 'node:stream';
import { ExcelFont } from './generate-excel.interface.js';
import {
  BookRowCell,
  BuilderHeaderParams,
} from './table-template-e.interface.js';

export interface SheetTableObject<T> {
  headers?: BookRowCell[];
  rows?: (item: T, index: number) => BookRowCell[];
}

export interface TableReportParams<T> {
  dataSource?: () => AsyncGenerator<T, void, unknown>;
  sheetName?: string;
  sheetHeader?: Partial<BuilderHeaderParams>;
  table?: SheetTableObject<T>;
  font?: ExcelFont;
  zoneId?: string;
}

export interface RenderDataParams<T> {
  dataSource?: () => AsyncGenerator<T, void, unknown>;
  workbook: ExcelJS.stream.xlsx.WorkbookWriter;
  worksheet: Worksheet;
  getRowCallback?: (item: T, index: number) => BookRowCell[];
  stream: PassThrough;
}
