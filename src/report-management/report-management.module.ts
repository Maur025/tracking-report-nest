import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportRequest } from './entities/report-request.entity.js';
import { REPORT_QUEUE_NAME } from './queue/queue-values.js';
import { ReportConsumer } from './queue/report-consumer.js';
import { ReportProducer } from './queue/report-producer.js';
import { ReportManagementController } from './report-management.controller.js';
import { ReportManagementService } from './report-management.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportRequest]),

    BullModule.registerQueue({
      name: REPORT_QUEUE_NAME,
    }),
  ],
  controllers: [ReportManagementController],
  providers: [ReportManagementService, ReportProducer, ReportConsumer],
  exports: [ReportProducer],
})
export class ReportManagementModule {}
