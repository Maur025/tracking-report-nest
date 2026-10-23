import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { REPORT_QUEUE_NAME } from '../infrastructure/queue/queue-values.js';
import { EventModule } from '../modules/event/event.module.js';
import { EventConsumerService } from '../modules/event/services/event-consumer.service.js';
import { ProgressModule } from '../modules/progress/progress.module.js';
import { ProgressConsumerService } from '../modules/progress/services/progress-consumer.service.js';
import { ReportGenerator } from '../report-management/interfaces/report-generator.js';
import { ReportManagementModule } from '../report-management/report-management.module.js';
import { ReportConsumer } from './report-consumer.js';
import { ReportGenerateStrategyService } from './report-generate-strategy.service.js';
import { REPORT_GENERATORS } from './report-generators-token.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: REPORT_QUEUE_NAME,
    }),

    ReportManagementModule,

    EventModule,

    ProgressModule,
  ],
  providers: [
    ReportGenerateStrategyService,
    ReportConsumer,
    {
      provide: REPORT_GENERATORS,
      useFactory: (
        event: EventConsumerService,
        progress: ProgressConsumerService,
      ): ReportGenerator[] => [event, progress],
      inject: [EventConsumerService, ProgressConsumerService],
    },
  ],
})
export class ReportProcessingModule {}
