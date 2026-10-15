import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RulesReportQueryParams } from './dto/rules-report-query-params.js';
import { RulesController } from './rules.controller.js';
import { RulesService } from './rules.service.js';

describe('RulesController', () => {
  let controller: RulesController;
  let mockGenerateReportStream: Mock;

  beforeEach(async () => {
    mockGenerateReportStream = vi.fn().mockResolvedValue(new PassThrough());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        {
          provide: RulesService,
          useValue: { generateReportStream: mockGenerateReportStream },
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
    const params = { databaseName: 'db', format: 'excel' } as RulesReportQueryParams;

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
      fileName: 'rules',
      disposition: 'inline',
    } as RulesReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getHeaders().type).toBe('application/pdf');
    expect(response.getHeaders().disposition).toBe('inline; filename=rules.pdf');
  });

  it('should respond with an excel stream otherwise', async () => {
    // WHEN
    const response = await controller.generateReportStream({
      databaseName: 'db',
      format: 'excel',
      fileName: 'rules',
    } as RulesReportQueryParams);

    // THEN
    expect(response).toBeInstanceOf(StreamableFile);
    expect(response.getHeaders().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.getHeaders().disposition).toBe(
      'attachment; filename=rules.xlsx',
    );
  });
});
