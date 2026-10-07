import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PdfReportServiceImpl } from './pdf-report-impl.service.js';

describe('PdfReportService', () => {
  let service: PdfReportServiceImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfReportServiceImpl],
    }).compile();

    service = module.get<PdfReportServiceImpl>(PdfReportServiceImpl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
