import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExcelReportService } from '../../report/services/excel-report.service.js';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { ProgressClientService } from './progress-client.service.js';
import { ProgressService } from './progress.service.js';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: ProgressClientService, useValue: {} },
        { provide: PdfReportService, useValue: {} },
        { provide: ExcelReportService, useValue: {} },
        { provide: EnterpriseConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
