import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  GenerateReportJob,
  REPORT_JOBS,
  REPORT_QUEUE_NAME,
} from './queue-values.js';

@Processor(REPORT_QUEUE_NAME, { concurrency: 2 })
export class ReportConsumer extends WorkerHost {
  constructor() {
    super();
  }

  // async process(job: Parameters<WorkerHost['process']>[0]): Promise<void> {}
  async process(job: Job<GenerateReportJob>): Promise<void> {
    switch (job.name) {
      case REPORT_JOBS.GENERATE_PDF: {
        return;
      }
      case REPORT_JOBS.GENERATE_EXCEL: {
        return;
      }
      default: {
        throw new Error(`Unknown job name: ${job.name}`);
      }
    }
  }
}
