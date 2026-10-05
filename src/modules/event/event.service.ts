import { Injectable } from '@nestjs/common';
import { EventReportQueryParams } from './dto/event-report-query-params.js';

@Injectable()
export class EventService {
  findAll() {
    return `This action returns all event`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  async generateReportStream(eventReportQueryParams: EventReportQueryParams) {
    console.log(eventReportQueryParams);
  }
}
