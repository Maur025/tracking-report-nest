import { Controller, Get, Param, Query } from '@nestjs/common';
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
    const document = await this.eventService.generateReportStream(
      eventReportQueryParams,
    );

    return pdfStreamResponse(
      document,
      eventReportQueryParams.fileName,
      eventReportQueryParams.disposition,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }
}
