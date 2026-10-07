import type {
  AddHorizontalLineParams,
  AddTextParams,
  CommonPdfParams,
  FontStyle,
  GetFontResponse,
  GetTextHeightParams,
  GetUsableWidthParams,
} from '../interfaces/common-pdf.interface.js';
import type { PdfFont } from '../interfaces/generate-pdf.interface.js';

export const commonPdf = ({ document, defaultFont }: CommonPdfParams) => {
  /**
   * Position related functions
   */

  const getPageHeight = (): number => document.page.height;

  const getPageWidth = (): number => document.page.width;

  const getPageMarginStart = (): number => document.page.margins.left;

  const getPageMarginEnd = (): number =>
    getPageWidth() - document.page.margins.right;

  const getPageMarginTop = (): number => document.page.margins.top;

  const getPageMarginBottom = (): number =>
    getPageHeight() - document.page.margins.bottom;

  const getYPositionFromTop = (value: number): number =>
    getPageMarginTop() + value;

  const getXPositionFromStart = (value: number): number =>
    getPageMarginStart() + value;

  const getYPositionFromBottom = (value: number): number =>
    getPageMarginBottom() - value;

  const getXPositionFromEnd = (value: number): number =>
    getPageMarginEnd() - value;

  const getTableXColumnPositions = (columnWidths: number[] = []): number[] => {
    const xColumns = [getPageMarginStart()];
    let xPosition = getPageMarginStart();

    for (const width of columnWidths) {
      xColumns.push(xPosition + width);
      xPosition += width;
    }

    return xColumns;
  };

  const getUsableWidth = ({
    width,
    paddingStart,
    paddingEnd,
    paddingX,
  }: GetUsableWidthParams): number => {
    if (paddingX) {
      return width - paddingX * 2;
    }

    if (paddingStart && paddingEnd) {
      return width - paddingStart - paddingEnd;
    }

    if (paddingStart) {
      return width - paddingStart;
    }

    if (paddingEnd) {
      return width - paddingEnd;
    }

    return width;
  };

  const getTextHeight = ({
    text = '',
    fontSize = 11,
    width,
  }: GetTextHeightParams): number => {
    return document.fontSize(fontSize).heightOfString(text, { width });
  };

  /**
   * Font related functions
   */

  const getFont = (fontName?: PdfFont): GetFontResponse => {
    if (!fontName) {
      return {
        regular: 'Times-Roman',
        bold: 'Times-Bold',
        italic: 'Times-Italic',
        boldItalic: 'Times-BoldItalic',
      };
    }

    return {
      regular: fontName,
      bold: `${fontName}-Bold`,
      italic: `${fontName}-Italic`,
      boldItalic: `${fontName}-BoldItalic`,
    };
  };

  const resolveFont = (font?: PdfFont): GetFontResponse =>
    getFont(font ? font : defaultFont);

  const getFontStyle = (bold?: boolean, italic?: boolean): FontStyle => {
    if (bold && italic) return 'boldItalic';
    if (bold) return 'bold';
    if (italic) return 'italic';
    return 'regular';
  };

  /**
   * PDF content related functions
   */

  const addText = ({
    text = '',
    fontSize = 11,
    font,
    bold,
    italic,
    x,
    y,
    options,
  }: AddTextParams): void => {
    const fontResolved = resolveFont(font);

    document
      .font(fontResolved[getFontStyle(bold, italic)])
      .fontSize(fontSize)
      .text(text, x, y, options);
  };

  const addHorizontalLine = ({
    xStart = getPageMarginStart(),
    xEnd = getPageMarginEnd(),
    y = getPageMarginTop(),
  }: AddHorizontalLineParams): void => {
    document.moveTo(xStart, y).lineTo(xEnd, y).stroke();
  };

  const addNewPage = (): number => {
    document.addPage();
    return getPageMarginTop();
  };

  return {
    // Position related functions
    getPageHeight,
    getPageWidth,
    getPageMarginStart,
    getPageMarginEnd,
    getPageMarginTop,
    getPageMarginBottom,
    getYPositionFromTop,
    getXPositionFromStart,
    getYPositionFromBottom,
    getXPositionFromEnd,
    getTableXColumnPositions,
    getUsableWidth,
    getTextHeight,

    // Font related functions
    getFont,
    resolveFont,
    getFontStyle,

    // PDF content related functions
    addText,
    addHorizontalLine,
    addNewPage,
  };
};
