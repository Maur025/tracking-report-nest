import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReportConsumer } from './report-consumer.js';
import { GenerateReportJob, REPORT_JOBS } from './queue-values.js';

describe('ReportConsumer', () => {
  let service: ReportConsumer;

  const buildJob = (name: string) =>
    ({ name, data: { reportId: 'report-123' } }) as Job<GenerateReportJob>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportConsumer],
    }).compile();

    service = module.get<ReportConsumer>(ReportConsumer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve for a GENERATE_PDF job', async () => {
    // WHEN / THEN
    await expect(
      service.process(buildJob(REPORT_JOBS.GENERATE_PDF)),
    ).resolves.toBeUndefined();
  });

  it('should resolve for a GENERATE_EXCEL job', async () => {
    // WHEN / THEN
    await expect(
      service.process(buildJob(REPORT_JOBS.GENERATE_EXCEL)),
    ).resolves.toBeUndefined();
  });

  it('should throw for an unknown job name', async () => {
    // WHEN / THEN
    await expect(service.process(buildJob('unknown-job'))).rejects.toThrow(
      'Unknown job name: unknown-job',
    );
  });

  it('should throw for an empty job name', async () => {
    // WHEN / THEN
    await expect(service.process(buildJob(''))).rejects.toThrow(
      'Unknown job name: ',
    );
  });
});
