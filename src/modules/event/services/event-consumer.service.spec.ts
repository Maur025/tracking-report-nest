import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { EventReportQueryParams } from '../dto/event-report-query-params.js';
import { EventConsumerService } from './event-consumer.service.js';
import { EventService } from './event.service.js';

describe('ConsumerService', () => {
  let service: EventConsumerService;
  let mockGenerateReportStream: Mock;

  beforeEach(async () => {
    mockGenerateReportStream = vi.fn().mockResolvedValue('report-stream');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventConsumerService,
        {
          provide: EventService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
      ],
    }).compile();

    service = module.get<EventConsumerService>(EventConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose the event report type', () => {
    expect(service.type).toBe('event');
  });

  describe('generate', () => {
    it('should delegate the generation to the event service with the stored payload', async () => {
      // GIVEN
      const payload = {
        databaseName: 'enterprise_1_db',
        format: 'pdf',
      } as EventReportQueryParams;

      const reportRequest = {
        id: 'report-1',
        payload,
      } as unknown as ReportRequest;

      // WHEN
      const result = await service.generate(reportRequest);

      // THEN
      expect(mockGenerateReportStream).toHaveBeenCalledWith(payload);
      expect(result).toBe('report-stream');
    });

    it('should propagate the error raised by the event service', async () => {
      // GIVEN
      mockGenerateReportStream.mockRejectedValue(
        new Error('Generation failed'),
      );

      // WHEN / THEN
      await expect(
        service.generate({ id: 'report-1', payload: {} } as ReportRequest),
      ).rejects.toThrow('Generation failed');
    });
  });
});
