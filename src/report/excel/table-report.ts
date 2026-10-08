import { Logger } from '@nestjs/common';
import { GenerateExcelResponse } from '../interfaces/generate-excel.interface.js';
import {
  RenderDataParams,
  TableReportParams,
} from '../interfaces/table-report-e.interface.js';
import { tableTemplate } from './table-template.js';

const logger = new Logger('[Excel] reportTable');

export const tableReport =
  <T>({
    dataSource,
    sheetHeader = {},
    table = {},
    font = 'Arial',
    zoneId = 'UTC',
    sheetName = 'Sheet1',
  }: TableReportParams<T>) =>
  ({ workbook, stream }: GenerateExcelResponse) => {
    const { headers = [], rows = () => [] } = table;

    const {
      setColumnDefinitions,
      builderHeader,
      addSheet,
      addRowBreak,
      addRow,
    } = tableTemplate({
      workbook,
    });

    const worksheet = addSheet(sheetName);
    setColumnDefinitions({
      worksheet,
      rowCells: headers,
      font,
      defaultSize: 11,
    });

    builderHeader({
      ...sheetHeader,
      worksheet,
      zoneId,
    });

    addRowBreak({ worksheet });

    addRow({
      worksheet,
      rowCells: headers,
      rowStyle: {
        font: { bold: true, name: font },
      },
    });

    renderData<T>({
      workbook,
      worksheet,
      stream,
      dataSource,
      getRowCallback: rows,
    });

    return stream;
  };

const renderData = async <T>({
  dataSource,
  workbook,
  worksheet,
  getRowCallback = () => [],
  stream,
}: RenderDataParams<T>) => {
  const { addRow } = tableTemplate({ workbook });

  try {
    let index = 1;

    if (dataSource) {
      for await (const item of dataSource()) {
        addRow({ worksheet, rowCells: getRowCallback(item, index) });
        index++;
      }
    }

    await worksheet.commit();
    await workbook.commit();
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));

    logger.error('Error rendering data', cause.stack);
    stream.destroy(cause);
  }
};
