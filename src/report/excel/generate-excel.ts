import ExcelJS from 'exceljs';
import { PassThrough } from 'node:stream';
import { GenerateExcelResponse } from '../interfaces/generate-excel.interface.js';

export const generateExcel = (): GenerateExcelResponse => {
  const stream = new PassThrough();

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream,
    useStyles: true,
    useSharedStrings: true,
  });

  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible',
    },
  ];

  const closeWorkbook = async (): Promise<void> => {
    await workbook.commit();
  };

  return {
    stream,
    workbook,
    closeWorkbook,
  };
};
