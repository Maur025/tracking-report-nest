import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventReportQueryParams } from './dto/event-report-query-params.js';
import { EventService } from './event.service.js';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('reports')
  generateReportStream(
    @Query() eventReportQueryParams: EventReportQueryParams,
  ) {
    return this.eventService.generateReportStream(eventReportQueryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }
}
