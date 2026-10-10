import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExcelReportService } from '../../report/services/excel-report.service.js';
import { PdfReportService } from '../../report/services/pdf-report.service.js';
import { EnterpriseConfigService } from '../enterprise/enterprise-config.service.js';
import { RulesClientService } from './rules-client.service.js';
import { RulesService } from './rules.service.js';

describe('RulesService', () => {
  let service: RulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        { provide: RulesClientService, useValue: {} },
        { provide: PdfReportService, useValue: {} },
        { provide: ExcelReportService, useValue: {} },
        { provide: EnterpriseConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});