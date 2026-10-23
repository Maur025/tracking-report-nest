import { Injectable } from '@nestjs/common';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { ReportProducer } from '../../../report-management/queue/report-producer.js';
import { ReportRequestService } from '../../../report-management/services/report-request.service.js';
import { EnterpriseConfigService } from '../../enterprise/enterprise-config.service.js';
import { EventReportQueryParams } from '../dto/event-report-query-params.js';

@Injectable()
export class QueueService {
  constructor(
    private readonly reportProducer: ReportProducer,
    private readonly reportRequestService: ReportRequestService,
    private readonly enterpriseConfigService: EnterpriseConfigService,
  ) {}

  async addReportToQueue(request: EventReportQueryParams) {
    const { databaseName, format } = request;

    await this.enterpriseConfigService.findByDatabaseNameThrow({
      databaseName,
    });

    const reportRequest = await this.reportRequestService.create({
      type: ReportTypeEnum.EVENT,
      payload: request,
    });

    if (format === 'pdf') {
      await this.reportProducer.generatePdf({ reportId: reportRequest.id });

      return { reportRequestId: reportRequest.id };
    }

    await this.reportProducer.generateExcel({ reportId: reportRequest.id });
    return { reportRequestId: reportRequest.id };
  }
}
