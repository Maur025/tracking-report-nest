import ExcelJS from 'exceljs';
import { describe, expect, it, vi } from 'vitest';
import { tableTemplate } from './table-template.js';

const buildWorkbook = () => {
  const worksheet = {
    addRow: vi.fn().mockImplementation((values) => ({
      values,
      commit: vi.fn(),
      getCell: vi.fn().mockReturnValue({
        style: {},
        font: {},
        alignment: {},
        border: {},
      }),
    })),
    commit: vi.fn(),
    columns: [] as unknown[],
  };

  const workbook = {
    addWorksheet: vi.fn().mockReturnValue(worksheet),
  };

  return { workbook, worksheet };
};

describe('excel tableTemplate', () => {
  describe('addSheet', () => {
    it('should add a worksheet with the given name', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { addSheet } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      const result = addSheet('EventReport');

      // THEN
      expect(workbook.addWorksheet).toHaveBeenCalledWith('EventReport');
      expect(result).toBe(worksheet);
    });

    it('should throw an error when the sheet name is missing', () => {
      // GIVEN
      const { workbook } = buildWorkbook();
      const { addSheet } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN / THEN
      expect(() => addSheet()).toThrow('Sheet name is required');
      expect(() => addSheet('')).toThrow('Sheet name is required');
    });
  });

  describe('setColumnDefinitions', () => {
    it('should build the column definitions with a sequential key and the default width', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { setColumnDefinitions } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      setColumnDefinitions({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        rowCells: [{ value: 'Nro' }, { value: 'Fecha', width: 30 }],
        font: 'Arial',
        defaultSize: 11,
      });

      // THEN
      expect(worksheet.columns).toEqual([
        {
          key: 'col_1',
          width: 20,
          style: expect.objectContaining({
            font: expect.objectContaining({ name: 'Arial', size: 11 }),
            alignment: expect.objectContaining({
              wrapText: true,
              vertical: 'middle',
              horizontal: 'left',
            }),
          }),
        },
        {
          key: 'col_2',
          width: 30,
          style: expect.objectContaining({
            font: expect.objectContaining({ name: 'Arial', size: 11 }),
          }),
        },
      ]);
    });

    it('should use the font size of the cell when it is provided', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { setColumnDefinitions } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      setColumnDefinitions({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        rowCells: [{ value: 'Nro', fontSize: 8 }],
        font: 'Arial',
        defaultSize: 11,
      });

      // THEN
      expect(worksheet.columns[0]).toEqual(
        expect.objectContaining({
          style: expect.objectContaining({
            font: expect.objectContaining({ name: 'Arial', size: 8 }),
          }),
        }),
      );
    });

    it('should merge the custom style with the default one', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { setColumnDefinitions } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      setColumnDefinitions({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        rowCells: [
          {
            value: 'Nro',
            style: {
              alignment: { horizontal: 'center' },
              font: { bold: true },
            },
          },
        ],
        font: 'Arial',
        defaultSize: 11,
      });

      // THEN
      expect(worksheet.columns[0]).toEqual(
        expect.objectContaining({
          style: expect.objectContaining({
            font: expect.objectContaining({ name: 'Arial', bold: true }),
            alignment: expect.objectContaining({
              wrapText: true,
              vertical: 'middle',
              horizontal: 'center',
            }),
          }),
        }),
      );
    });

    it('should not define any column when there are no cells', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { setColumnDefinitions } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      setColumnDefinitions({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
      });

      // THEN
      expect(worksheet.columns).toEqual([]);
    });
  });

  describe('addRow', () => {
    it('should add the values of the cells and commit the row', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { addRow } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      addRow({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        rowCells: [{ value: 'Nro' }, { value: 1 }],
      });

      // THEN
      expect(worksheet.addRow).toHaveBeenCalledWith(['Nro', 1]);
    });

    it('should not style the cells when the styles are disabled', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { addRow } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      addRow({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        rowCells: [{ value: 'Nro', style: { font: { bold: true } } }],
        useStyles: false,
      });

      // THEN
      expect(worksheet.addRow).toHaveBeenCalledWith(['Nro']);
    });

    it('should apply the row style and the cell style', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const getCell = vi.fn().mockReturnValue({
        style: {},
        font: {},
        alignment: {},
        border: {},
      });

      worksheet.addRow.mockReturnValue({
        values: [],
        commit: vi.fn(),
        getCell,
      });

      const { addRow } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      addRow({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        rowCells: [
          { value: 'Nro', fontSize: 8, style: { font: { italic: true } } },
        ],
        rowStyle: { font: { bold: true } },
      });

      // THEN
      expect(getCell).toHaveBeenCalledWith(1);
      expect(getCell.mock.results[0].value.style).toEqual(
        expect.objectContaining({
          font: expect.objectContaining({ bold: true, italic: true, size: 8 }),
        }),
      );
    });

    it('should add an empty row when there are no cells', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { addRow } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      addRow({ worksheet: worksheet as unknown as ExcelJS.Worksheet });

      // THEN
      expect(worksheet.addRow).toHaveBeenCalledWith([]);
    });
  });

  describe('addRowBreak', () => {
    it('should add the requested number of empty rows', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { addRowBreak } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      addRowBreak({ worksheet: worksheet as unknown as ExcelJS.Worksheet, rows: 3 });

      // THEN
      expect(worksheet.addRow).toHaveBeenCalledTimes(3);
      expect(worksheet.addRow).toHaveBeenCalledWith([]);
    });

    it('should add a single empty row by default', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { addRowBreak } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      addRowBreak({ worksheet: worksheet as unknown as ExcelJS.Worksheet });

      // THEN
      expect(worksheet.addRow).toHaveBeenCalledTimes(1);
    });
  });

  describe('builderHeader', () => {
    it('should write the title, the enterprise, the user and the filter', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { builderHeader } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      builderHeader({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        title: { value: 'Reporte de eventos' },
        enterpriseName: { value: 'Acme' },
        username: { value: 'Usuario de prueba' },
        filterBy: { value: 'type=GEOFENCES' },
      });

      // THEN
      const rows = worksheet.addRow.mock.calls.map((call) => call[0]);
      expect(rows).toContainEqual(['Reporte de eventos']);
      expect(rows).toContainEqual(['Acme']);
      expect(rows).toContainEqual(['Usuario de prueba']);
      expect(rows).toContainEqual(['type=GEOFENCES']);
    });

    it('should skip the header rows whose value is empty', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { builderHeader } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      builderHeader({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        title: { value: '' },
        enterpriseName: { value: 'Acme' },
      });

      // THEN
      const rows = worksheet.addRow.mock.calls.map((call) => call[0]);
      expect(rows).toContainEqual(['Acme']);
      expect(rows).not.toContainEqual(['']);
    });

    it('should always write the issue date row', () => {
      // GIVEN
      const { workbook, worksheet } = buildWorkbook();
      const { builderHeader } = tableTemplate({
        workbook: workbook as unknown as ExcelJS.stream.xlsx.WorkbookWriter,
      });

      // WHEN
      builderHeader({
        worksheet: worksheet as unknown as ExcelJS.Worksheet,
        issueDate: { value: 1783800770835 },
        zoneId: 'America/La_Paz',
      });

      // THEN
      const rows = worksheet.addRow.mock.calls.map((call) => call[0]);
      const dateRow = rows.find(
        (row: unknown[]) => row[0] === 'Fecha: ',
      );
      expect(dateRow).toBeDefined();
      expect(dateRow[1]).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
