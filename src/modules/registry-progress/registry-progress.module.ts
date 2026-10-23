import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { ReportManagementModule } from '../../report-management/report-management.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { RegistryProgressController } from './registry-progress.controller.js';
import { QueueService } from './services/queue.service.js';
import { RegistryProgressClientService } from './services/registry-progress-client.service.js';
import { RegistryProgressConsumerService } from './services/registry-progress-consumer.service.js';
import { RegistryProgressService } from './services/registry-progress.service.js';

@Module({
  imports: [ReportGeneratorModule, ReportManagementModule, EnterpriseModule],
  controllers: [RegistryProgressController],
  providers: [
    RegistryProgressService,
    RegistryProgressClientService,
    QueueService,
    RegistryProgressConsumerService,
  ],
  exports: [RegistryProgressConsumerService],
})
export class RegistryProgressModule {}
