import { describe, expect, it, vi } from 'vitest';
import { tableTemplate } from './table-template.js';

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
  image: vi.fn(),
  restore: vi.fn(),
});

describe('pdf tableTemplate', () => {
  describe('builderPageTitle', () => {
    it('should write the title at the page margin when there is no logo', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageTitle } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageTitle('REPORTE DE EVENTOS', false);

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        'REPORTE DE EVENTOS',
        40,
        20,
        undefined,
      );
    });

    it('should displace the title when the enterprise has a logo', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageTitle } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageTitle('REPORTE DE EVENTOS', true);

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        'REPORTE DE EVENTOS',
        160,
        20,
        undefined,
      );
    });
  });

  describe('builderPageHeader', () => {
    it('should draw the enterprise logo when it is provided', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageHeader({ enterpriseLogo: 'data:image/png;base64,logo' });

      // THEN
      expect(document.image).toHaveBeenCalledWith(
        'data:image/png;base64,logo',
        40,
        20,
        { height: 65 },
      );
    });

    it('should not draw the logo when it is not provided', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageHeader({ enterpriseName: 'Acme' });

      // THEN
      expect(document.image).not.toHaveBeenCalled();
    });

    it('should write the enterprise name, the user, the filter and the issue date', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageHeader({
        enterpriseName: 'Acme',
        username: 'Juan Perez',
        filterBy: 'type=GEOFENCES',
        issueDate: 1783800770835,
      });

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(texts).toContain('Acme');
      expect(texts).toContain('Usuario: Juan Perez');
      expect(texts).toContain('Filtrado por: type=GEOFENCES');
      expect(
        texts.some((text: string) =>
          String(text).startsWith('Fecha de emisión:'),
        ),
      ).toBe(true);
      expect(document.restore).toHaveBeenCalled();
    });

    it('should fall back to the default username when it is not provided', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageHeader({});

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(texts).toContain('Usuario: Sin Nombre');
    });

    it('should omit the user line when the username is empty', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageHeader({ username: '' });

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(
        texts.some((text: string) => String(text).startsWith('Usuario:')),
      ).toBe(false);
    });

    it('should omit the filter when it is not provided', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageHeader({ enterpriseName: 'Acme' });

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(
        texts.some((text: string) => String(text).startsWith('Filtrado por:')),
      ).toBe(false);
    });
  });

  describe('builderTableHeader', () => {
    it('should write one column per header', () => {
      // GIVEN
      const document = buildDocument();
      const { builderTableHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderTableHeader({
        columnHeaders: [{ text: 'Nro' }, { text: 'Fecha' }],
        xColumns: [40, 70],
        y: 100,
        columnWidths: [30, 60],
      });

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(texts).toContain('Nro');
      expect(texts).toContain('Fecha');
    });

    it('should not write anything when there are no headers', () => {
      // GIVEN
      const document = buildDocument();
      const { builderTableHeader } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderTableHeader({});

      // THEN
      expect(document.text).not.toHaveBeenCalled();
    });
  });

  describe('addTableColumnText', () => {
    it('should skip the column when it has no value object', () => {
      // GIVEN
      const document = buildDocument();
      const { addTableColumnText } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      addTableColumnText({ xColumn: 40, width: 30, y: 10 });

      // THEN
      expect(document.text).not.toHaveBeenCalled();
    });

    it('should write an empty text when the column has no text', () => {
      // GIVEN
      const document = buildDocument();
      const { addTableColumnText } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      addTableColumnText({ value: {}, xColumn: 40, width: 30, y: 10 });

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        '',
        40,
        10,
        expect.objectContaining({ width: 30 }),
      );
    });

    it('should apply the start padding to the x position', () => {
      // GIVEN
      const document = buildDocument();
      const { addTableColumnText } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      addTableColumnText({
        value: { text: 'Nro', paddingStart: 6 },
        xColumn: 40,
        width: 30,
        y: 10,
      });

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        'Nro',
        46,
        10,
        expect.objectContaining({ width: 24 }),
      );
    });

    it('should apply the horizontal padding to the x position and to the width', () => {
      // GIVEN
      const document = buildDocument();
      const { addTableColumnText } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      addTableColumnText({
        value: { text: 'Nro', paddingX: 4 },
        xColumn: 40,
        width: 30,
        y: 10,
      });

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        'Nro',
        44,
        10,
        expect.objectContaining({ width: 22 }),
      );
    });

    it('should fall back to the page margin and the default width', () => {
      // GIVEN
      const document = buildDocument();
      const { addTableColumnText } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      addTableColumnText({ value: { text: 'Nro' } });

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        'Nro',
        40,
        20,
        expect.objectContaining({ width: 10 }),
      );
    });
  });

  describe('builderPageFooter', () => {
    it('should write the page number and the print date', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageFooter } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageFooter({ height: 30, pageNumber: 2, paddingTop: 10 });

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(texts).toContain('Página 2');
      expect(
        texts.some((text: string) =>
          String(text).startsWith('Fecha de impresión:'),
        ),
      ).toBe(true);
    });

    it('should place the footer above the bottom margin', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageFooter } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageFooter({ height: 30, pageNumber: 1, paddingTop: 10 });

      // THEN
      expect(document.text).toHaveBeenCalledWith(
        'Página 1',
        40,
        742,
        expect.objectContaining({ width: 150 }),
      );
    });

    it('should write the page zero when no page number is given', () => {
      // GIVEN
      const document = buildDocument();
      const { builderPageFooter } = tableTemplate(
        document as unknown as PDFKit.PDFDocument,
      );

      // WHEN
      builderPageFooter({});

      // THEN
      const texts = document.text.mock.calls.map((call) => call[0]);
      expect(texts).toContain('Página 0');
    });
  });
});
