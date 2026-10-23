import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { EventReportQueryParams } from './dto/event-report-query-params.js';
import { EventService } from './services/event.service.js';
import { QueueService } from './services/queue.service.js';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly queueService: QueueService,
  ) {}

  @Get('reports')
  async generateReportStream(
    @Query() eventReportQueryParams: EventReportQueryParams,
  ) {
    const { format, fileName, disposition } = eventReportQueryParams;

    const response = await this.eventService.generateReportStream(
      eventReportQueryParams,
    );

    if (format === 'pdf') {
      return pdfStreamResponse(response, fileName, disposition);
    }

    return excelStreamResponse(response, fileName);
  }

  @Post('reports/queue')
  @HttpCode(HttpStatus.ACCEPTED)
  async addReportToQueue(@Body() request: EventReportQueryParams) {
    return this.queueService.addReportToQueue(request);
  }
}
