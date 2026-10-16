import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { REPORT_QUEUE_NAME } from './queue-values.js';
import { ReportProducer } from './report-producer.js';

describe('ReportProducer', () => {
  let service: ReportProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportProducer,
        { provide: getQueueToken(REPORT_QUEUE_NAME), useValue: {} },
      ],
    }).compile();

    service = module.get<ReportProducer>(ReportProducer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
