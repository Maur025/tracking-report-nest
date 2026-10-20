import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportRequest } from './entities/report-request.entity.js';
import { REPORT_QUEUE_NAME } from './queue/queue-values.js';
import { ReportConsumer } from './queue/report-consumer.js';
import { ReportProducer } from './queue/report-producer.js';
import { ReportController } from './report.controller.js';
import { ReportManagementService } from './services/report-management.service.js';
import { ReportRequestService } from './services/report-request.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportRequest]),

    BullModule.registerQueue({
      name: REPORT_QUEUE_NAME,
    }),
  ],
  controllers: [ReportController],
  providers: [
    ReportManagementService,
    ReportProducer,
    ReportConsumer,
    ReportRequestService,
  ],
  exports: [ReportProducer, ReportRequestService],
})
export class ReportManagementModule {}
