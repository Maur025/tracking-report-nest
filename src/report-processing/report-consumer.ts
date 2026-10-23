import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import path from 'node:path';
import {
  GenerateReportJob,
  REPORT_JOBS,
  REPORT_QUEUE_NAME,
} from '../infrastructure/queue/queue-values.js';
import { ReportStatusEnum } from '../report-management/enums/report-status.enum.js';
import { ReportRequestService } from '../report-management/services/report-request.service.js';
import { saveStreamToFile } from '../shared/utils/save-stream-file.js';
import { ReportGenerateStrategyService } from './report-generate-strategy.service.js';

@Processor(REPORT_QUEUE_NAME, { concurrency: 2 })
export class ReportConsumer extends WorkerHost {
  private readonly logger = new Logger('ReportConsumer');
  private staticPath: string;

  constructor(
    private readonly reportRequestService: ReportRequestService,
    private readonly reportGenerateStrategyService: ReportGenerateStrategyService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.staticPath = configService.getOrThrow<string>('APP_STATIC_PATH');
  }

  async process(job: Job<GenerateReportJob>): Promise<void> {
    this.logger.log(`Processing job with data: ${JSON.stringify(job.data)}`);

    const reportRequest = await this.reportRequestService.findOneByIdThrow(
      job.data.reportId,
    );

    await this.reportRequestService.update(reportRequest.id, {
      status: ReportStatusEnum.PROCESSING,
    });

    const strategy = this.reportGenerateStrategyService.getStrategy(
      reportRequest.type,
    );

    const { filePath, fullPath } = this.getPaths(job.name, reportRequest.id);

    try {
      const pdfReportStream = await strategy.generate(reportRequest);

      await saveStreamToFile(pdfReportStream, fullPath);

      await this.reportRequestService.update(reportRequest.id, {
        status: ReportStatusEnum.COMPLETED,
        filePath,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error processing job ${job.name} for report ${reportRequest.id}: ${errorMessage}`,
      );

      await this.reportRequestService.update(reportRequest.id, {
        status: ReportStatusEnum.FAILED,
        errorMessage,
      });

      throw error;
    }
  }

  private getPaths(
    jobName: string,
    reportRequestId: string,
  ): { filePath: string; fullPath: string } {
    const extensions: Record<string, string> = {
      [REPORT_JOBS.GENERATE_PDF]: 'pdf',
      [REPORT_JOBS.GENERATE_EXCEL]: 'xlsx',
    };

    const extension = extensions[jobName];

    if (!extension) {
      throw new Error(`Unknown job name: ${jobName}`);
    }

    const directory = extension === 'pdf' ? 'pdf' : 'excel';

    const filePath = path.join(
      'reports',
      directory,
      `report-${reportRequestId}.${extension}`,
    );

    return {
      filePath,
      fullPath: path.join(this.staticPath, filePath),
    };
  }
}
