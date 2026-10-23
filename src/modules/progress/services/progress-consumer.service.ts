import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { ReportGenerator } from '../../../report-management/interfaces/report-generator.js';
import { ProgressReportQueryParams } from '../dto/progress-report-query-params.js';
import { ProgressService } from './progress.service.js';

@Injectable()
export class ProgressConsumerService implements ReportGenerator {
  type: string = ReportTypeEnum.PROGRESS;

  constructor(private readonly progressService: ProgressService) {}

  async generate(
    reportRequest: ReportRequest,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { payload } = reportRequest;

    return this.progressService.generateReportStream(
      payload as ProgressReportQueryParams,
    );
  }
}
