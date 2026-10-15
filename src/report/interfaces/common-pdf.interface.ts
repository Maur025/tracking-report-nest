import { PdfFont } from './generate-pdf.interface.js';

export interface CommonPdfParams {
  document: PDFKit.PDFDocument;
  defaultFont: PdfFont;
}

export interface AddTextParams {
  text?: string;
  fontSize?: number;
  x?: number;
  y?: number;
  bold?: boolean;
  italic?: boolean;
  font?: PdfFont;
  options?: PDFKit.Mixins.TextOptions;
}

export interface GetFontResponse {
  regular: string;
  bold: string;
  italic: string;
  boldItalic: string;
}

export interface AddHorizontalLineParams {
  xStart?: number;
  xEnd?: number;
  y?: number;
}

export interface GetUsableWidthParams {
  width: number;
  paddingStart?: number;
  paddingEnd?: number;
  paddingX?: number;
}

export interface GetTextHeightParams {
  text?: string;
  fontSize?: number;
  width?: number;
}

export type FontStyle = 'regular' | 'bold' | 'italic' | 'boldItalic';
