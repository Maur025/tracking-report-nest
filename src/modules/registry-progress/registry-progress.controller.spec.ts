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

  beforeEach(async () => {
    mockGenerateReportStream = vi.fn().mockResolvedValue(new PassThrough());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryProgressController],
      providers: [
        {
          provide: RegistryProgressService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
        {
          provide: QueueService,
          useValue: {},
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
    expect(mockGenerateReportStream).toHaveBeenCalledWith(params);
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
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=registry.xlsx',
    );
  });
});
