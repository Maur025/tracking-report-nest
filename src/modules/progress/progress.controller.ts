import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { ProgressReportQueryParams } from './dto/progress-report-query-params.js';
import { ProgressService } from './services/progress.service.js';
import { QueueService } from './services/queue.service.js';

@Controller('progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly queueService: QueueService,
  ) {}

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

  @Post('reports/queue')
  async addReportToQueue(@Body() request: ProgressReportQueryParams) {
    return this.queueService.addReportToQueue(request);
  }
}
