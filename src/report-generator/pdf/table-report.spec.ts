import PdfKit from 'pdfkit';
import { describe, expect, it, vi } from 'vitest';
import { initializeDocument } from './generate-pdf.js';
import { reportTable } from './table-report.js';

interface ReportItem {
  name: string;
  value: string;
}

const collectPdf = (document: PDFKit.PDFDocument): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
  });

const buildDataSource = (items: ReportItem[]) =>
  (async function* () {
    yield* items;
  })();

const buildDocument = (): PDFKit.PDFDocument =>
  initializeDocument({ fonts: ['Inter'] });

describe('pdf reportTable', () => {
  it('should build a pdf document with the given rows', async () => {
    // GIVEN
    const items: ReportItem[] = [
      { name: 'Ruta 1', value: '10' },
      { name: 'Ruta 2', value: '20' },
    ];

    const builder = reportTable<ReportItem>({
      dataSource: () => buildDataSource(items),
      mainTitle: 'Reporte de prueba',
      pageHeader: { enterpriseName: 'Acme', username: 'Juan Perez' },
      table: {
        columnWidths: [100, 100],
        columnHeaders: [{ text: 'Nombre' }, { text: 'Valor' }],
        columnRows: (item) => [{ text: item.name }, { text: item.value }],
      },
    });

    // WHEN
    const document = builder(buildDocument());

    // THEN
    expect(document).toBeInstanceOf(PdfKit);

    const buffer = await collectPdf(document);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('should build a pdf document without rows', async () => {
    // GIVEN
    const builder = reportTable<ReportItem>({
      dataSource: () => buildDataSource([]),
      mainTitle: 'Reporte vacío',
    });

    // WHEN
    const document = builder(buildDocument());

    // THEN
    const buffer = await collectPdf(document);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('should add a new page when a row does not fit in the remaining space', async () => {
    // GIVEN
    const items: ReportItem[] = Array.from({ length: 80 }, (_, index) => ({
      name: `Ruta ${index}`,
      value: `${index}`,
    }));

    const addPage = vi.spyOn(PdfKit.prototype, 'addPage');

    const builder = reportTable<ReportItem>({
      dataSource: () => buildDataSource(items),
      mainTitle: 'Reporte largo',
      table: {
        columnWidths: [100, 100],
        columnHeaders: [{ text: 'Nombre' }, { text: 'Valor' }],
        columnRows: (item) => [{ text: item.name }, { text: item.value }],
      },
    });

    // WHEN
    const document = builder(buildDocument());

    await collectPdf(document);

    // THEN
    expect(addPage).toHaveBeenCalled();

    addPage.mockRestore();
  });

  it('should destroy the document when the data source fails', async () => {
    // GIVEN
    const builder = reportTable<ReportItem>({
      dataSource: () =>
        (async function* () {
          yield { name: 'Ruta 1', value: '1' };
          throw new Error('Data source exploded');
        })(),
      mainTitle: 'Reporte con error',
    });

    // WHEN
    const document = builder(buildDocument());

    // THEN
    await expect(collectPdf(document)).rejects.toThrow('Data source exploded');
  });
});
