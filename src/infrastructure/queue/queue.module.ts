import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
        defaultJobOptions: {
          attempts: config.get<number>('BULLMQ_JOB_ATTEMPTS'),
          backoff: {
            type: config.getOrThrow<string>('BULLMQ_JOB_BACKOFF_TYPE'),
            delay: config.get<number>('BULLMQ_JOB_BACKOFF_DELAY'),
          },
          removeOnComplete: config.get<number>('BULLMQ_JOB_REMOVE_ON_COMPLETE'),
          removeOnFail: config.get<number>('BULLMQ_JOB_REMOVE_ON_FAIL'),
        },
      }),
    }),
  ],
})
export class QueueModule {}
