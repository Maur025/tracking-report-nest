import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RegistryProgressReportQueryParams } from './dto/registry-progress-report-query-params.js';
import { RegistryProgressController } from './registry-progress.controller.js';
import { QueueService } from './services/queue.service.js';
import { RegistryProgressService } from './services/registry-progress.service.js';

describe('RegistryProgressController', () => {
  let controller: RegistryProgressController;
  let mockGenerateReportStream: Mock;

  let mockAddReportToQueue: Mock;
  let stream: PassThrough;

  beforeEach(async () => {
    stream = new PassThrough();
    mockGenerateReportStream = vi.fn().mockResolvedValue(stream);
    mockAddReportToQueue = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryProgressController],
      providers: [
        {
          provide: RegistryProgressService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
        {
          provide: QueueService,
          useValue: { addReportToQueue: mockAddReportToQueue },
        },
      ],
    }).compile();

    controller = module.get<RegistryProgressController>(
      RegistryProgressController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate the report generation to the service', async () => {
    // GIVEN
    const params = {
      databaseName: 'db',
      format: 'excel',
    } as RegistryProgressReportQueryParams;

    // WHEN
    await controller.generateReportStream(params);

    // THEN
    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(params);
    expect(mockGenerateReportStream.mock.calls[0][0]).toBe(params);
    expect(mockAddReportToQueue).not.toHaveBeenCalled();
  });

  it('should respond with a pdf stream when the format is pdf', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'pdf',
      fileName: 'registry',
      disposition: 'inline',
    } as RegistryProgressReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getStream()).toBe(stream);
    expect(mockAddReportToQueue).not.toHaveBeenCalled();
    expect(response.getHeaders().type).toBe('application/pdf');
    expect(response.getHeaders().disposition).toBe(
      'inline; filename=registry.pdf',
    );
  });

  it('should respond with an excel stream otherwise', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'excel',
      fileName: 'registry',
    } as RegistryProgressReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getStream()).toBe(stream);
    expect(mockAddReportToQueue).not.toHaveBeenCalled();
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=registry.xlsx',
    );
  });

  it('should enqueue the exact request and return the queue result', async () => {
    const request = {
      databaseName: 'db',
      format: 'pdf',
    } as RegistryProgressReportQueryParams;
    const queued = { reportRequestId: 'report-1' };
    mockAddReportToQueue.mockResolvedValue(queued);

    const result = await controller.addReportToQueue(request);

    expect(mockAddReportToQueue).toHaveBeenCalledExactlyOnceWith(request);
    expect(mockAddReportToQueue.mock.calls[0][0]).toBe(request);
    expect(result).toBe(queued);
    expect(mockGenerateReportStream).not.toHaveBeenCalled();
  });

  it('should propagate a stream generation error without enqueueing', async () => {
    const error = new Error('Generation failed');
    const request = {
      databaseName: 'db',
      format: 'pdf',
    } as RegistryProgressReportQueryParams;
    mockGenerateReportStream.mockRejectedValue(error);

    await expect(controller.generateReportStream(request)).rejects.toBe(error);

    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(request);
    expect(mockAddReportToQueue).not.toHaveBeenCalled();
  });

  it('should propagate an enqueueing error without generating a stream', async () => {
    const error = new Error('Enqueue failed');
    const request = {
      databaseName: 'db',
      format: 'excel',
    } as RegistryProgressReportQueryParams;
    mockAddReportToQueue.mockRejectedValue(error);

    await expect(controller.addReportToQueue(request)).rejects.toBe(error);

    expect(mockAddReportToQueue).toHaveBeenCalledExactlyOnceWith(request);
    expect(mockGenerateReportStream).not.toHaveBeenCalled();
  });
});
