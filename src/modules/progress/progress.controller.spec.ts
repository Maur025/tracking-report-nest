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

  beforeEach(async () => {
    mockGenerateReportStream = vi.fn().mockResolvedValue(new PassThrough());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        {
          provide: ProgressService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
        { provide: QueueService, useValue: {} },
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
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=progress.xlsx',
    );
  });
});
