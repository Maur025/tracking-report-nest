import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { ReportManagementModule } from '../../report-management/report-management.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { EventController } from './event.controller.js';
import { EventClientService } from './services/event-client.service.js';
import { EventConsumerService } from './services/event-consumer.service.js';
import { EventService } from './services/event.service.js';
import { QueueService } from './services/queue.service.js';

@Module({
  imports: [ReportGeneratorModule, ReportManagementModule, EnterpriseModule],
  controllers: [EventController],
  providers: [
    EventService,
    EventClientService,
    QueueService,
    EventConsumerService,
  ],
  exports: [EventConsumerService],
})
export class EventModule {}
