import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { ReportGenerator } from '../../../report-management/interfaces/report-generator.js';
import { EventReportQueryParams } from '../dto/event-report-query-params.js';
import { EventService } from './event.service.js';

@Injectable()
export class EventConsumerService implements ReportGenerator {
  type: string = ReportTypeEnum.EVENT;

  constructor(private readonly eventService: EventService) {}

  async generate(
    reportRequest: ReportRequest,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { payload } = reportRequest;

    return this.eventService.generateReportStream(
      payload as EventReportQueryParams,
    );
  }
}
