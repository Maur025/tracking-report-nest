import { Controller, Get, Param, Query, StreamableFile } from '@nestjs/common';
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

    return new StreamableFile(document, {
      type: 'application/pdf',
      disposition: 'attachment; filename=event-report.pdf',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }
}
