import type {
  PageMargins,
  PdfFont,
  PdfPageSize,
} from './generate-pdf.interface.js';
import type {
  PageHeaderObject,
  TableObject,
} from './table-report.interface.js';

export interface GenerateReportParams<T> {
  dataSource: () => AsyncGenerator<T, void, unknown>;
  mainTitle?: string;
  pageHeader?: PageHeaderObject;
  table?: TableObject<T>;
  zoneId?: string;
  pageSize?: PdfPageSize;
  pageMargins?: PageMargins;
  fonts?: PdfFont[];
}
