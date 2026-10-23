import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { RulesReportQueryParams } from './dto/rules-report-query-params.js';
import { QueueService } from './services/queue.service.js';
import { RulesService } from './services/rules.service.js';

@Controller('rules')
export class RulesController {
  constructor(
    private readonly rulesService: RulesService,
    private readonly queueService: QueueService,
  ) {}

  @Get('reports')
  async generateReportStream(
    @Query() rulesReportQueryParams: RulesReportQueryParams,
  ) {
    const { format, fileName, disposition } = rulesReportQueryParams;

    const response = await this.rulesService.generateReportStream(
      rulesReportQueryParams,
    );

    if (format === 'pdf') {
      return pdfStreamResponse(response, fileName, disposition);
    }

    return excelStreamResponse(response, fileName);
  }

  @Post('reports/queue')
  async addReportToQueue(@Body() request: RulesReportQueryParams) {
    return this.queueService.addReportToQueue(request);
  }
}
