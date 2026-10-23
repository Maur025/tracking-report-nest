import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RulesReportQueryParams } from './dto/rules-report-query-params.js';
import { RulesController } from './rules.controller.js';
import { QueueService } from './services/queue.service.js';
import { RulesService } from './services/rules.service.js';

describe('RulesController', () => {
  let controller: RulesController;
  let mockGenerateReportStream: Mock;
  let mockAddReportToQueue: Mock;
  let stream: PassThrough;

  beforeEach(async () => {
    stream = new PassThrough();
    mockGenerateReportStream = vi.fn().mockResolvedValue(stream);
    mockAddReportToQueue = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        {
          provide: RulesService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
        {
          provide: QueueService,
          useValue: { addReportToQueue: mockAddReportToQueue },
        },
      ],
    }).compile();

    controller = module.get<RulesController>(RulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate the report generation to the service', async () => {
    // GIVEN
    const params = {
      databaseName: 'db',
      format: 'excel',
    } as RulesReportQueryParams;

    // WHEN
    await controller.generateReportStream(params);

    // THEN
    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(params);
    expect(mockGenerateReportStream.mock.calls[0][0]).toBe(params);
  });

  it.each(['inline', 'attachment'] as const)(
    'should respond with a %s pdf stream',
    async (disposition) => {
      // WHEN
      const response = await controller.generateReportStream({
        databaseName: 'db',
        format: 'pdf',
        fileName: 'rules',
        disposition,
      } as RulesReportQueryParams);

      // THEN
      expect(response).toBeInstanceOf(StreamableFile);
      expect(response.getStream()).toBe(stream);
      expect(response.getHeaders().type).toBe('application/pdf');
      expect(response.getHeaders().disposition).toBe(
        `${disposition}; filename=rules.pdf`,
      );
    },
  );

  it('should respond with an excel stream otherwise', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'excel',
      fileName: 'rules',
    } as RulesReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getStream()).toBe(stream);
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=rules.xlsx',
    );
  });

  it('should delegate queueing and return the same result', async () => {
    const request = {
      databaseName: 'db',
      format: 'pdf',
    } as RulesReportQueryParams;
    const result = { reportRequestId: 'report-1' };
    mockAddReportToQueue.mockResolvedValue(result);

    await expect(controller.addReportToQueue(request)).resolves.toBe(result);
    expect(mockAddReportToQueue).toHaveBeenCalledExactlyOnceWith(request);
    expect(mockAddReportToQueue.mock.calls[0][0]).toBe(request);
    expect(mockGenerateReportStream).not.toHaveBeenCalled();
  });

  it('should propagate generation errors', async () => {
    const error = new Error('Generation failed');
    mockGenerateReportStream.mockRejectedValue(error);

    await expect(
      controller.generateReportStream({
        databaseName: 'db',
        format: 'pdf',
      } as RulesReportQueryParams),
    ).rejects.toBe(error);
    expect(mockAddReportToQueue).not.toHaveBeenCalled();
  });

  it('should propagate queueing errors', async () => {
    const error = new Error('Queueing failed');
    mockAddReportToQueue.mockRejectedValue(error);

    await expect(
      controller.addReportToQueue({
        databaseName: 'db',
        format: 'excel',
      } as RulesReportQueryParams),
    ).rejects.toBe(error);
    expect(mockGenerateReportStream).not.toHaveBeenCalled();
  });
});
