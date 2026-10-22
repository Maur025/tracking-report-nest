import { PassThrough } from 'node:stream';
import { ReportRequest } from '../entities/report-request.entity.js';

export interface ReportGenerator {
  readonly type: string;

  generate(
    reportRequest: ReportRequest,
  ): Promise<PDFKit.PDFDocument | PassThrough>;
}
