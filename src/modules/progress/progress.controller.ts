import { Controller, Get, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { ProgressReportQueryParams } from './dto/progress-report-query-params.js';
import { ProgressService } from './progress.service.js';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('reports')
  async generateReportStream(
    @Query() progressReportQueryParams: ProgressReportQueryParams,
  ) {
    const { format, fileName, disposition } = progressReportQueryParams;

    const response = await this.progressService.generateReportStream(
      progressReportQueryParams,
    );

    if (format === 'pdf') {
      return pdfStreamResponse(response, fileName, disposition);
    }

    return excelStreamResponse(response, fileName);
  }
}
