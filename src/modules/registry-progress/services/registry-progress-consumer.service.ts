import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { ReportGenerator } from '../../../report-management/interfaces/report-generator.js';
import { RegistryProgressReportQueryParams } from '../dto/registry-progress-report-query-params.js';
import { RegistryProgressService } from './registry-progress.service.js';

@Injectable()
export class RegistryProgressConsumerService implements ReportGenerator {
  type: string = ReportTypeEnum.REGISTRY_PROGRESS;

  constructor(
    private readonly registryProgressService: RegistryProgressService,
  ) {}

  async generate(
    reportRequest: ReportRequest,
  ): Promise<PDFKit.PDFDocument | PassThrough> {
    const { payload } = reportRequest;

    return this.registryProgressService.generateReportStream(
      payload as RegistryProgressReportQueryParams,
    );
  }
}
