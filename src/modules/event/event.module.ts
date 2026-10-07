import { Module } from '@nestjs/common';
import { ReportModule } from '../../report/report.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { EventClientService } from './event-client.service.js';
import { EventController } from './event.controller.js';
import { EventService } from './event.service.js';

@Module({
  imports: [ReportModule, EnterpriseModule],
  controllers: [EventController],
  providers: [EventService, EventClientService],
})
export class EventModule {}
