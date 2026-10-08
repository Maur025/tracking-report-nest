import { Module } from '@nestjs/common';
import { ExcelReportServiceImpl } from './services/excel-report-impl.service.js';
import { ExcelReportService } from './services/excel-report.service.js';
import { PdfReportServiceImpl } from './services/pdf-report-impl.service.js';
import { PdfReportService } from './services/pdf-report.service.js';

@Module({
  providers: [
    {
      provide: PdfReportService,
      useClass: PdfReportServiceImpl,
    },
    { provide: ExcelReportService, useClass: ExcelReportServiceImpl },
  ],
  exports: [PdfReportService, ExcelReportService],
})
export class ReportModule {}
