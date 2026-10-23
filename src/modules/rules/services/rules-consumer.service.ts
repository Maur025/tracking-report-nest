import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { ReportGenerator } from '../../../report-management/interfaces/report-generator.js';
import { RulesReportQueryParams } from '../dto/rules-report-query-params.js';
import { RulesService } from './rules.service.js';

@Injectable()
export class RulesConsumerService implements ReportGenerator {
  type: string = ReportTypeEnum.RULES;

  constructor(private readonly rulesService: RulesService) {}

  async generate(
    reportRequest: ReportRequest,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { payload } = reportRequest;

    return this.rulesService.generateReportStream(
      payload as RulesReportQueryParams,
    );
  }
}
