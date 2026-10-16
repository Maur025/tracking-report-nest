import ExcelJS from 'exceljs';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import type { TableReportParams } from '../interfaces/table-report-e.interface.js';
import { ExcelReportServiceImpl } from './excel-report-impl.service.js';

const collectStream = (stream: PassThrough): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

interface ReportItem {
  name: string;
  value: number;
}

describe('ExcelReportServiceImpl', () => {
  it('should generate an xlsx stream with the report data', async () => {
    // GIVEN
    const service = new ExcelReportServiceImpl();
    const items: ReportItem[] = [
      { name: 'Ruta 1', value: 10 },
      { name: 'Ruta 2', value: 20 },
    ];
    const params: TableReportParams<ReportItem> = {
      sheetName: 'TestReport',
      dataSource: () =>
        (async function* () {
          yield* items;
        })(),
      table: {
        headers: [
          { value: 'Nombre', width: 20 },
          { value: 'Valor', width: 10 },
        ],
        rows: (item) => [{ value: item.name }, { value: item.value }],
      },
    };

    // WHEN
    const stream = service.generate(params);

    // THEN
    expect(stream).toBeInstanceOf(PassThrough);

    const buffer = await collectStream(stream);
    expect(buffer.length).toBeGreaterThan(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    expect(workbook.getWorksheet('TestReport')).toBeDefined();
  });

  it('should generate a report even when there is no data source', async () => {
    // GIVEN
    const service = new ExcelReportServiceImpl();

    // WHEN
    const stream = service.generate<ReportItem>({
      sheetName: 'EmptyReport',
      table: { headers: [{ value: 'Nombre' }], rows: () => [] },
    });

    // THEN
    const buffer = await collectStream(stream);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    expect(workbook.getWorksheet('EmptyReport')).toBeDefined();
  });
});
