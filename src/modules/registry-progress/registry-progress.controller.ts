import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { RegistryProgressReportQueryParams } from './dto/registry-progress-report-query-params.js';
import { QueueService } from './services/queue.service.js';
import { RegistryProgressService } from './services/registry-progress.service.js';

@Controller('registry-progress')
export class RegistryProgressController {
  constructor(
    private readonly registryProgressService: RegistryProgressService,
    private readonly queueService: QueueService,
  ) {}

  @Get('reports')
  async generateReportStream(
    @Query()
    registryProgressReportQueryParams: RegistryProgressReportQueryParams,
  ) {
    const { format, fileName, disposition } = registryProgressReportQueryParams;

    const response = await this.registryProgressService.generateReportStream(
      registryProgressReportQueryParams,
    );

    if (format === 'pdf') {
      return pdfStreamResponse(response, fileName, disposition);
    }

    return excelStreamResponse(response, fileName);
  }

  @Post('reports/queue')
  async addReportToQueue(@Body() request: RegistryProgressReportQueryParams) {
    return this.queueService.addReportToQueue(request);
  }
}
