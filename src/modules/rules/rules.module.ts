import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { ReportManagementModule } from '../../report-management/report-management.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { RulesController } from './rules.controller.js';
import { QueueService } from './services/queue.service.js';
import { RulesClientService } from './services/rules-client.service.js';
import { RulesConsumerService } from './services/rules-consumer.service.js';
import { RulesService } from './services/rules.service.js';

@Module({
  imports: [ReportGeneratorModule, ReportManagementModule, EnterpriseModule],
  controllers: [RulesController],
  providers: [
    RulesService,
    RulesClientService,
    QueueService,
    RulesConsumerService,
  ],
  exports: [RulesConsumerService],
})
export class RulesModule {}
