import { describe, expect, it, vi } from 'vitest';
import { commonPdf } from './common-pdf.js';

const buildDocument = () => ({
  page: {
    height: 792,
    width: 612,
    margins: { top: 20, bottom: 30, left: 40, right: 50 },
  },
  font: vi.fn().mockReturnThis(),
  fontSize: vi.fn().mockReturnThis(),
  heightOfString: vi.fn().mockReturnValue(12),
  text: vi.fn(),
  moveTo: vi.fn().mockReturnThis(),
  lineTo: vi.fn().mockReturnThis(),
  stroke: vi.fn(),
  addPage: vi.fn(),
});

describe('commonPdf', () => {
  describe('position helpers', () => {
    it('should resolve the page dimensions and margins', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getPageHeight()).toBe(792);
      expect(common.getPageWidth()).toBe(612);
      expect(common.getPageMarginStart()).toBe(40);
      expect(common.getPageMarginEnd()).toBe(562);
      expect(common.getPageMarginTop()).toBe(20);
      expect(common.getPageMarginBottom()).toBe(762);
    });

    it('should offset the positions from the page margins', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getYPositionFromTop(10)).toBe(30);
      expect(common.getXPositionFromStart(5)).toBe(45);
      expect(common.getYPositionFromBottom(10)).toBe(752);
      expect(common.getXPositionFromEnd(10)).toBe(552);
    });

    it('should return only the start margin when there are no columns', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getTableXColumnPositions()).toEqual([40]);
      expect(common.getTableXColumnPositions([])).toEqual([40]);
    });

    it('should accumulate the column widths into the x positions', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getTableXColumnPositions([100, 50, 25])).toEqual([
        40, 140, 190, 215,
      ]);
    });
  });

  describe('getUsableWidth', () => {
    it('should return the width when there is no padding', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getUsableWidth({ width: 100 })).toBe(100);
    });

    it('should subtract both sides when the horizontal padding is provided', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getUsableWidth({ width: 100, paddingX: 5 })).toBe(90);
    });

    it('should subtract both paddings when the start and the end are provided', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(
        common.getUsableWidth({ width: 100, paddingStart: 5, paddingEnd: 10 }),
      ).toBe(85);
    });

    it('should subtract only the start padding when it is the only one', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getUsableWidth({ width: 100, paddingStart: 5 })).toBe(95);
    });

    it('should subtract only the end padding when it is the only one', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getUsableWidth({ width: 100, paddingEnd: 10 })).toBe(90);
    });

    it('should ignore a zero horizontal padding', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getUsableWidth({ width: 100, paddingX: 0 })).toBe(100);
    });
  });

  describe('getTextHeight', () => {
    it('should measure the string with the given font size and width', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      const height = common.getTextHeight({
        text: 'contenido',
        fontSize: 8,
        width: 50,
      });

      // THEN
      expect(document.fontSize).toHaveBeenCalledWith(8);
      expect(document.heightOfString).toHaveBeenCalledWith('contenido', {
        width: 50,
      });
      expect(height).toBe(12);
    });

    it('should measure an empty text with the default font size', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      common.getTextHeight({ width: 50 });

      // THEN
      expect(document.fontSize).toHaveBeenCalledWith(11);
      expect(document.heightOfString).toHaveBeenCalledWith('', { width: 50 });
    });
  });

  describe('fonts', () => {
    it('should fall back to the times family when there is no font name', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getFont()).toEqual({
        regular: 'Times-Roman',
        bold: 'Times-Bold',
        italic: 'Times-Italic',
        boldItalic: 'Times-BoldItalic',
      });
    });

    it('should build the font variants from the given font name', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getFont('Roboto')).toEqual({
        regular: 'Roboto',
        bold: 'Roboto-Bold',
        italic: 'Roboto-Italic',
        boldItalic: 'Roboto-BoldItalic',
      });
    });

    it('should resolve the default font when no font is provided', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.resolveFont().regular).toBe('Inter');
      expect(common.resolveFont('Roboto').regular).toBe('Roboto');
    });

    it('should map the bold and italic flags to a font style', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // THEN
      expect(common.getFontStyle()).toBe('regular');
      expect(common.getFontStyle(false, false)).toBe('regular');
      expect(common.getFontStyle(true, false)).toBe('bold');
      expect(common.getFontStyle(false, true)).toBe('italic');
      expect(common.getFontStyle(true, true)).toBe('boldItalic');
    });
  });

  describe('content helpers', () => {
    it('should write the text with the resolved font', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      common.addText({
        text: 'Reporte',
        fontSize: 14,
        bold: true,
        x: 10,
        y: 20,
        options: { width: 100 },
      });

      // THEN
      expect(document.font).toHaveBeenCalledWith('Inter-Bold');
      expect(document.fontSize).toHaveBeenCalledWith(14);
      expect(document.text).toHaveBeenCalledWith('Reporte', 10, 20, {
        width: 100,
      });
    });

    it('should write an empty text with the default font size', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      common.addText({});

      // THEN
      expect(document.font).toHaveBeenCalledWith('Inter');
      expect(document.fontSize).toHaveBeenCalledWith(11);
      expect(document.text).toHaveBeenCalledWith('', undefined, undefined, undefined);
    });

    it('should draw a horizontal line between the given positions', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      common.addHorizontalLine({ xStart: 10, xEnd: 100, y: 50 });

      // THEN
      expect(document.moveTo).toHaveBeenCalledWith(10, 50);
      expect(document.lineTo).toHaveBeenCalledWith(100, 50);
      expect(document.stroke).toHaveBeenCalled();
    });

    it('should draw the horizontal line between the margins by default', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      common.addHorizontalLine({});

      // THEN
      expect(document.moveTo).toHaveBeenCalledWith(40, 20);
      expect(document.lineTo).toHaveBeenCalledWith(562, 20);
    });

    it('should add a new page and return the top margin', () => {
      // GIVEN
      const document = buildDocument();
      const common = commonPdf({ document, defaultFont: 'Inter' });

      // WHEN
      const y = common.addNewPage();

      // THEN
      expect(document.addPage).toHaveBeenCalledTimes(1);
      expect(y).toBe(20);
    });
  });
});
