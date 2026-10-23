import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  GenerateReportJob,
  REPORT_JOBS,
  REPORT_QUEUE_NAME,
} from '../../infrastructure/queue/queue-values.js';

@Injectable()
export class ReportProducer {
  constructor(
    @InjectQueue(REPORT_QUEUE_NAME) private readonly reportQueue: Queue,
  ) {}

  async generatePdf(data: GenerateReportJob) {
    return this.reportQueue.add(REPORT_JOBS.GENERATE_PDF, data, {
      jobId: `pdf-${data.reportId}`,
    });
  }

  async generateExcel(data: GenerateReportJob) {
    return this.reportQueue.add(REPORT_JOBS.GENERATE_EXCEL, data, {
      jobId: `excel-${data.reportId}`,
    });
  }
}
