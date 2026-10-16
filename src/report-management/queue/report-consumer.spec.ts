import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportConsumer } from './report-consumer.js';

describe('ReportConsumer', () => {
  let service: ReportConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportConsumer],
    }).compile();

    service = module.get<ReportConsumer>(ReportConsumer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
