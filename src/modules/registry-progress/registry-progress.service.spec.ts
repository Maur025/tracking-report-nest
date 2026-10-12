import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExcelReportService } from '../../report/services/excel-report.service.js';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { RegistryProgressClientService } from './registry-progress-client.service.js';
import { RegistryProgressService } from './registry-progress.service.js';

describe('RegistryProgressService', () => {
  let service: RegistryProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryProgressService,
        {
          provide: RegistryProgressClientService,
          useValue: {},
        },
        {
          provide: PdfReportService,
          useValue: {},
        },
        {
          provide: ExcelReportService,
          useValue: {},
        },
        { provide: EnterpriseConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<RegistryProgressService>(RegistryProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
