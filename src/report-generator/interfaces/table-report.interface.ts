import {
  GetTextHeightParams,
  GetUsableWidthParams,
} from './common-pdf.interface.js';
import { TableRowObject } from './table-template.interface.js';

export interface PageHeaderObject {
  username?: string;
  issueDate?: number;
  filterBy?: string;
  enterpriseName?: string;
  enterpriseLogo?: string;
}

export interface TableObject<T> {
  columnWidths?: number[];
  columnHeaders?: TableRowObject[];
  columnRows?: (item: T, index: number) => TableRowObject[];
}

export interface ReportTableParams<T> {
  dataSource: () => AsyncGenerator<T, void, unknown>;
  mainTitle?: string;
  pageHeader?: PageHeaderObject;
  table?: TableObject<T>;
  zoneId?: string;
}

export interface CalculateCellMaxHeightParams {
  columnWidths?: number[];
  values?: TableRowObject[];
  getUsableWidth?: (params: GetUsableWidthParams) => number;
  getTextHeight?: (params: GetTextHeightParams) => number;
}

export interface RenderTableBodyParams<T> {
  document: PDFKit.PDFDocument;
  y: number;
  columnWidths?: number[];
  footerHeight?: number;
  xColumns?: number[];
  columnRows?: (item: T, index: number) => TableRowObject[];
  dataSource: () => AsyncGenerator<T, void, unknown>;
}
