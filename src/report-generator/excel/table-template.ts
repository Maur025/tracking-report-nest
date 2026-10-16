import type { Column } from 'exceljs';
import { formatDateOfTimestamp } from '../../shared/utils/format-date-of-timestamp.js';
import { ExcelFont } from '../interfaces/generate-excel.interface.js';
import {
  AddRowBreakParams,
  AddRowParams,
  BuilderHeaderParams,
  SetColumnDefinitionsParams,
  TableTemplateParams,
} from '../interfaces/table-template-e.interface.js';

export const tableTemplate = ({ workbook }: TableTemplateParams) => {
  const DEFAULT_FONT: ExcelFont = 'Arial';

  const addSheet = (name?: string) => {
    if (!name) {
      throw new Error('Sheet name is required');
    }

    return workbook.addWorksheet(name);
  };

  const setColumnDefinitions = ({
    worksheet,
    rowCells = [],
    font = DEFAULT_FONT,
    defaultSize = 8,
  }: SetColumnDefinitionsParams): void => {
    const columnDefinitions: Partial<Column>[] = rowCells.map(
      ({ fontSize, width = 20, style = {} }, index) => ({
        key: `col_${index + 1}`,
        width,
        style: {
          ...style,
          font: {
            name: font,
            size: fontSize || defaultSize,
            ...style.font,
          },
          alignment: {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'left',
            ...style.alignment,
          },
        },
      }),
    );

    worksheet.columns = columnDefinitions;
  };

  const addRow = ({
    worksheet,
    rowCells = [],
    useStyles = true,
    rowStyle = {},
  }: AddRowParams) => {
    const rowWorksheet = worksheet.addRow(rowCells.map(({ value }) => value));

    if (useStyles) {
      rowCells.forEach(({ style: cellStyle = {}, fontSize }, index) => {
        const rowCell = rowWorksheet.getCell(index + 1);

        rowCell.style = {
          ...rowCell.style,
          ...rowStyle,
          ...cellStyle,
          font: {
            ...rowCell.font,
            ...rowStyle.font,
            ...cellStyle.font,
            ...(fontSize !== undefined && { size: fontSize }),
          },
          alignment: {
            ...rowCell.alignment,
            ...rowStyle.alignment,
            ...cellStyle.alignment,
          },
          border: {
            ...rowCell.border,
            ...rowStyle.border,
            ...cellStyle.border,
          },
        };
      });
    }

    rowWorksheet.commit();
  };

  const addRowBreak = ({ worksheet, rows = 1 }: AddRowBreakParams) => {
    for (let i = 0; i < rows; i++) {
      const row = worksheet.addRow([]);
      row.commit();
    }
  };

  const builderHeader = ({
    worksheet,
    title,
    username,
    filterBy,
    enterpriseName,
    issueDate,
    zoneId = 'UTC',
  }: BuilderHeaderParams) => {
    if (title && title.value) {
      addRow({
        worksheet,
        rowCells: [title],
        rowStyle: { alignment: { wrapText: false }, font: { bold: true } },
      });
    }

    if (enterpriseName && enterpriseName.value) {
      addRow({
        worksheet,
        rowCells: [enterpriseName],
        rowStyle: { alignment: { wrapText: false } },
      });
    }

    if (username && username.value) {
      addRow({
        worksheet,
        rowCells: [username],
        rowStyle: { alignment: { wrapText: false } },
      });
    }

    if (filterBy && filterBy.value) {
      addRow({
        worksheet,
        rowCells: [filterBy],
        rowStyle: { alignment: { wrapText: false } },
      });
    }

    addRow({
      worksheet,
      rowCells: [
        {
          value: 'Fecha: ',
          style: { font: { bold: true }, alignment: { wrapText: false } },
        },
        {
          value: formatDateOfTimestamp({
            timestamp:
              typeof issueDate?.value === 'number'
                ? issueDate.value
                : undefined,
            zoneId,
          }),
          style: { alignment: { wrapText: false } },
        },
      ],
    });
  };

  return {
    addSheet,
    addRow,
    addRowBreak,

    setColumnDefinitions,
    builderHeader,
  };
};
