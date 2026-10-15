import { GenerateReportParams } from '../interfaces/pdf-report-service.interface.js';

export abstract class PdfReportService {
  abstract generate<T>(params: GenerateReportParams<T>): PDFKit.PDFDocument;
}
