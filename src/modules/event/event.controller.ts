import { Controller, Get, Param, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { EventReportQueryParams } from './dto/event-report-query-params.js';
import { EventService } from './event.service.js';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('reports')
  async generateReportStream(
    @Query() eventReportQueryParams: EventReportQueryParams,
  ) {
    const response = await this.eventService.generateReportStream(
      eventReportQueryParams,
    );

    if (!response) {
      return;
    }

    if (eventReportQueryParams.format === 'pdf') {
      return pdfStreamResponse(
        response,
        eventReportQueryParams.fileName,
        eventReportQueryParams.disposition,
      );
    }

    return excelStreamResponse(response, eventReportQueryParams.fileName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }
}
