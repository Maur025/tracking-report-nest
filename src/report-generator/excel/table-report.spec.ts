import ExcelJS from 'exceljs';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { generateExcel } from './generate-excel.js';
import { tableReport } from './table-report.js';

interface ReportItem {
  name: string;
  value: number;
}

const collectStream = (stream: PassThrough): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

describe('excel tableReport', () => {
  it('should build an xlsx file with the header and the rows', async () => {
    // GIVEN
    const items: ReportItem[] = [
      { name: 'Ruta 1', value: 10 },
      { name: 'Ruta 2', value: 20 },
    ];

    const builder = tableReport<ReportItem>({
      sheetName: 'EventReport',
      sheetHeader: {
        title: { value: 'Reporte de eventos' },
        username: { value: 'Usuario de prueba' },
        enterpriseName: { value: 'Acme' },
      },
      table: {
        headers: [{ value: 'Nombre' }, { value: 'Valor' }],
        rows: (item) => [{ value: item.name }, { value: item.value }],
      },
      dataSource: () =>
        (async function* () {
          yield* items;
        })(),
    });

    // WHEN
    const stream = builder(generateExcel());

    // THEN
    expect(stream).toBeInstanceOf(PassThrough);

    const buffer = await collectStream(stream);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet('EventReport');
    expect(worksheet).toBeDefined();
    // 1 título · 2 empresa · 3 usuario · 4 fecha · 5 separador · 6 encabezados
    expect(worksheet.getRow(1).getCell(1).value).toBe('Reporte de eventos');
    expect(worksheet.getRow(2).getCell(1).value).toBe('Acme');
    expect(worksheet.getRow(3).getCell(1).value).toBe('Usuario de prueba');
    expect(worksheet.getRow(5).getCell(1).value).toBeNull();
    expect(worksheet.getRow(6).getCell(1).value).toBe('Nombre');
    expect(worksheet.getRow(7).getCell(1).value).toBe('Ruta 1');
    expect(worksheet.getRow(8).getCell(2).value).toBe(20);
  });

  it('should build an xlsx file without a data source', async () => {
    // GIVEN
    const builder = tableReport<ReportItem>({
      sheetName: 'EmptyReport',
      table: {
        headers: [{ value: 'Nombre' }],
        rows: () => [],
      },
    });

    // WHEN
    const stream = builder(generateExcel());

    // THEN
    const buffer = await collectStream(stream);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(workbook.getWorksheet('EmptyReport')).toBeDefined();
  });

  it('should destroy the stream when the data source fails', async () => {
    // GIVEN
    const builder = tableReport<ReportItem>({
      sheetName: 'ErrorReport',
      table: {
        headers: [{ value: 'Nombre' }],
        rows: (item) => [{ value: item.name }],
      },
      dataSource: () =>
        (async function* () {
          yield { name: 'Ruta 1', value: 1 };
          throw new Error('Data source exploded');
        })(),
    });

    // WHEN
    const stream = builder(generateExcel());

    // THEN
    await expect(collectStream(stream)).rejects.toThrow('Data source exploded');
  });
});
