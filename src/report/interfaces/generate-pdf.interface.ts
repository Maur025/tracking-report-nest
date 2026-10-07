export type PdfUnit = 'cm' | 'pt';
export type PdfFont = 'Roboto' | 'Inter';
export type PdfPageSize =
  'LETTER' | 'A4' | 'EXECUTIVE' | 'LEGAL' | 'TABLOID' | 'A4';

export interface PageMargins {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  unit?: PdfUnit;
}

export interface initializeDocumentParams {
  pageSize?: PdfPageSize;
  pageMargins?: PageMargins;
  bufferPages?: boolean;
  fonts?: PdfFont[];
}

export interface LoadFontsParams {
  fonts: PdfFont[];
  document: PDFKit.PDFDocument;
}

export interface RegisterFontParams {
  font: PdfFont;
  document: PDFKit.PDFDocument;
  fontPath: string;
}
