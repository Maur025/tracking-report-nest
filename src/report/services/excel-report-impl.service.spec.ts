import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExcelReportServiceImpl } from './excel-report-impl.service.js';

describe('ExcelReportImplService', () => {
  let service: ExcelReportServiceImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelReportServiceImpl],
    }).compile();

    service = module.get<ExcelReportServiceImpl>(ExcelReportServiceImpl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
