import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ProgressReportQueryParams } from './dto/progress-report-query-params.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './services/progress.service.js';
import { QueueService } from './services/queue.service.js';

describe('ProgressController', () => {
  let controller: ProgressController;
  let mockGenerateReportStream: Mock;
  let mockAddReportToQueue: Mock;
  let stream: PassThrough;

  beforeEach(async () => {
    stream = new PassThrough();
    mockGenerateReportStream = vi.fn().mockResolvedValue(stream);
    mockAddReportToQueue = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        {
          provide: ProgressService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
        {
          provide: QueueService,
          useValue: { addReportToQueue: mockAddReportToQueue },
        },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate the report generation to the service', async () => {
    // GIVEN
    const params = {
      databaseName: 'db',
      format: 'excel',
    } as ProgressReportQueryParams;

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
      fileName: 'progress',
      disposition: 'inline',
    } as ProgressReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getStream()).toBe(stream);
    expect(response.getHeaders().type).toBe('application/pdf');
    expect(response.getHeaders().disposition).toBe(
      'inline; filename=progress.pdf',
    );
  });

  it('should respond with an excel stream otherwise', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'excel',
      fileName: 'progress',
    } as ProgressReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getStream()).toBe(stream);
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=progress.xlsx',
    );
  });
  it('should propagate report generation errors', async () => {
    const error = new Error('Generation failed');
    mockGenerateReportStream.mockRejectedValue(error);

    await expect(
      controller.generateReportStream({
        databaseName: 'db',
        format: 'pdf',
      } as ProgressReportQueryParams),
    ).rejects.toBe(error);
  });

  describe('addReportToQueue', () => {
    it('should pass the original payload to the queue and return its result', async () => {
      const request = {
        databaseName: 'db',
        format: 'excel',
      } as ProgressReportQueryParams;
      const result = { reportRequestId: 'report-123' };
      mockAddReportToQueue.mockResolvedValue(result);

      expect(await controller.addReportToQueue(request)).toBe(result);
      expect(mockAddReportToQueue).toHaveBeenCalledExactlyOnceWith(request);
      expect(mockAddReportToQueue.mock.calls[0][0]).toBe(request);
    });

    it('should propagate queue errors', async () => {
      const error = new Error('Queue failed');
      mockAddReportToQueue.mockRejectedValue(error);

      await expect(
        controller.addReportToQueue({
          databaseName: 'db',
          format: 'excel',
        } as ProgressReportQueryParams),
      ).rejects.toBe(error);
    });
  });
});
