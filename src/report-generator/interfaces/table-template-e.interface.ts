import ExcelJS, { Style, Worksheet } from 'exceljs';
import { ExcelFont } from './generate-excel.interface.js';

export interface TableTemplateParams {
  workbook: ExcelJS.stream.xlsx.WorkbookWriter;
}

export type RowHorizontalAlignment =
  'left' | 'center' | 'right' | 'fill' | 'justify';
export type RowVerticalAlignment =
  'top' | 'middle' | 'bottom' | 'distributed' | 'justify';

export interface BookRowCell {
  value?: string | number | boolean;
  fontSize?: number;
  width?: number;
  style?: Partial<Style>;
}

export interface SetColumnDefinitionsParams {
  worksheet: Worksheet;
  rowCells?: BookRowCell[];
  font?: ExcelFont;
  defaultSize?: number;
}

export interface BuilderHeaderParams {
  worksheet: Worksheet;
  title?: BookRowCell;
  username?: BookRowCell;
  filterBy?: BookRowCell;
  enterpriseName?: BookRowCell;
  enterpriseLogo?: BookRowCell;
  issueDate?: BookRowCell;
  zoneId?: string;
}

export interface AddRowParams {
  worksheet: Worksheet;
  rowCells?: BookRowCell[];
  useStyles?: boolean;
  rowStyle?: Partial<Style>;
}

export interface AddRowBreakParams {
  worksheet: Worksheet;
  rows?: number;
}
