import { Module } from '@nestjs/common';
import { PdfReportServiceImpl } from './services/pdf-report-impl.service.js';
import { PdfReportService } from './services/pdf-report.service.js';

@Module({
  providers: [
    {
      provide: PdfReportService,
      useClass: PdfReportServiceImpl,
    },
  ],
  exports: [PdfReportService],
})
export class ReportModule {}
