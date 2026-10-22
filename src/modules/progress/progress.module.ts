import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { ReportManagementModule } from '../../report-management/report-management.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { ProgressController } from './progress.controller.js';
import { ProgressClientService } from './services/progress-client.service.js';
import { ProgressConsumerService } from './services/progress-consumer.service.js';
import { ProgressService } from './services/progress.service.js';
import { QueueService } from './services/queue.service.js';

@Module({
  imports: [ReportGeneratorModule, ReportManagementModule, EnterpriseModule],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressClientService,
    QueueService,
    ProgressConsumerService,
  ],
  exports: [ProgressConsumerService],
})
export class ProgressModule {}
