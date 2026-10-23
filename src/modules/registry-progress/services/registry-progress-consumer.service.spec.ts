import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportRequest } from '../../../report-management/entities/report-request.entity.js';
import { ReportTypeEnum } from '../../../report-management/enums/report-type-enum.js';
import { RegistryProgressConsumerService } from './registry-progress-consumer.service.js';
import { RegistryProgressService } from './registry-progress.service.js';

describe('RegistryProgressConsumerService', () => {
  let service: RegistryProgressConsumerService;

  let mockGenerateReportStream: ReturnType<typeof vi.fn>;
  let stream: PassThrough;
  let request: ReportRequest;

  beforeEach(async () => {
    stream = new PassThrough();
    mockGenerateReportStream = vi.fn().mockResolvedValue(stream);
    request = Object.assign(new ReportRequest(), {
      id: 'report-1',
      payload: { databaseName: 'enterprise_db', format: 'pdf' },
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryProgressConsumerService,
        {
          provide: RegistryProgressService,
          useValue: { generateReportStream: mockGenerateReportStream },
        },
      ],
    }).compile();

    service = module.get<RegistryProgressConsumerService>(
      RegistryProgressConsumerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose the registry progress report type', () => {
    expect(service.type).toBe(ReportTypeEnum.REGISTRY_PROGRESS);
  });

  it('should generate from the stored payload and return the same stream', async () => {
    const result = await service.generate(request);

    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(
      request.payload,
    );
    expect(mockGenerateReportStream.mock.calls[0][0]).toBe(request.payload);
    expect(result).toBe(stream);
  });

  it('should propagate the generation error unchanged', async () => {
    const error = new Error('Generation failed');
    mockGenerateReportStream.mockRejectedValue(error);

    await expect(service.generate(request)).rejects.toBe(error);
    expect(mockGenerateReportStream).toHaveBeenCalledExactlyOnceWith(
      request.payload,
    );
  });
});
