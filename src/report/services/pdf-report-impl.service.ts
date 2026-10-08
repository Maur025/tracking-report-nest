import { Injectable } from '@nestjs/common';
import type { GenerateReportParams } from '../interfaces/pdf-report-service.interface.js';
import { initializeDocument } from '../pdf/generate-pdf.js';
import { reportTable } from '../pdf/table-report.js';
import { PdfReportService } from './pdf-report.service.js';

@Injectable()
export class PdfReportServiceImpl extends PdfReportService {
  generate<T>({
    dataSource,
    mainTitle = '',
    pageHeader = {},
    table = {},
    zoneId = 'UTC',
    pageSize = 'LETTER',
    pageMargins = { top: 2, bottom: 1, left: 2.5, right: 1, unit: 'cm' },
    fonts = ['Inter'],
  }: GenerateReportParams<T>): PDFKit.PDFDocument {
    const document = initializeDocument({
      pageSize,
      pageMargins,
      fonts,
    });

    const builderReport = reportTable({
      dataSource,
      mainTitle,
      pageHeader,
      table,
      zoneId,
    });

    builderReport(document);

    return document;
  }
}
