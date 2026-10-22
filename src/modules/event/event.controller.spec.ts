import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { EventReportQueryParams } from './dto/event-report-query-params.js';
import { EventController } from './event.controller.js';
import { EventService } from './services/event.service.js';
import { QueueService } from './services/queue.service.js';

describe('EventController', () => {
  let controller: EventController;
  let mockGenerateReportStream: Mock;
  let mockAddReportToQueue: Mock;

  beforeEach(async () => {
    mockGenerateReportStream = vi.fn().mockResolvedValue(new PassThrough());
    mockAddReportToQueue = vi
      .fn()
      .mockResolvedValue({ reportRequestId: 'report-123' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
        {
          provide: QueueService,
          useValue: { addReportToQueue: mockAddReportToQueue },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate the report generation to the service', async () => {
    // GIVEN
    const params = {
      databaseName: 'db',
      format: 'excel',
    } as EventReportQueryParams;

    // WHEN
    await controller.generateReportStream(params);

    // THEN
    expect(mockGenerateReportStream).toHaveBeenCalledWith(params);
  });

  it('should respond with a pdf stream when the format is pdf', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'pdf',
      fileName: 'events',
      disposition: 'inline',
    } as EventReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getHeaders().type).toBe('application/pdf');
    expect(response.getHeaders().disposition).toBe(
      'inline; filename=events.pdf',
    );
  });

  it('should respond with an excel stream otherwise', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'excel',
      fileName: 'events',
    } as EventReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=events.xlsx',
    );
  });

  describe('addReportToQueue', () => {
    it('should delegate the enqueue to the queue service', async () => {
      // GIVEN
      const request = {
        databaseName: 'db',
        format: 'pdf',
      } as EventReportQueryParams;

      // WHEN
      const result = await controller.addReportToQueue(request);

      // THEN
      expect(mockAddReportToQueue).toHaveBeenCalledWith(request);
      expect(result).toEqual({ reportRequestId: 'report-123' });
    });

    it('should propagate the error raised by the queue service', async () => {
      // GIVEN
      mockAddReportToQueue.mockRejectedValue(new Error('Enterprise not found'));

      // WHEN / THEN
      await expect(
        controller.addReportToQueue({
          databaseName: 'db',
        } as EventReportQueryParams),
      ).rejects.toThrow('Enterprise not found');
    });
  });
});
