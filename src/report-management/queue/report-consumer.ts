import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GenerateReportJob, REPORT_QUEUE_NAME } from './queue-values.js';

@Processor(REPORT_QUEUE_NAME, { concurrency: 2 })
export class ReportConsumer extends WorkerHost {
  constructor() {
    super();
  }

  // async process(job: Parameters<WorkerHost['process']>[0]): Promise<void> {}
  async process(job: Job<GenerateReportJob>): Promise<void> {}
}
