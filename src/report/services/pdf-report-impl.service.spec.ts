import PdfKit from 'pdfkit';
import { describe, expect, it } from 'vitest';
import type { GenerateReportParams } from '../interfaces/pdf-report-service.interface.js';
import { PdfReportServiceImpl } from './pdf-report-impl.service.js';

const collectPdf = (document: PDFKit.PDFDocument): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
  });

interface ReportItem {
  name: string;
  value: string;
}

describe('PdfReportServiceImpl', () => {
  it('should generate a pdf document from the given data source', async () => {
    // GIVEN
    const service = new PdfReportServiceImpl();
    const items: ReportItem[] = [{ name: 'Ruta 1', value: '10' }];
    const params: GenerateReportParams<ReportItem> = {
      dataSource: () =>
        (async function* () {
          yield* items;
        })(),
      mainTitle: 'Reporte de prueba',
      table: {
        columnWidths: [100, 100],
        columnHeaders: [{ text: 'Nombre', fontSize: 9 }],
        columnRows: (item) => [
          { text: item.name, fontSize: 9 },
          { text: item.value, fontSize: 9 },
        ],
      },
    };

    // WHEN
    const document = service.generate(params);

    // THEN
    expect(document).toBeInstanceOf(PdfKit);

    const buffer = await collectPdf(document);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('should generate a pdf document without a table definition', async () => {
    // GIVEN
    const service = new PdfReportServiceImpl();

    // WHEN
    const document = service.generate<ReportItem>({
      dataSource: () => (async function* () {})(),
      mainTitle: 'Sin tabla',
    });

    // THEN
    expect(document).toBeInstanceOf(PdfKit);

    const buffer = await collectPdf(document);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
