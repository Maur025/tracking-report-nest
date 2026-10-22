import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportGenerator } from '../report-management/interfaces/report-generator.js';
import { ReportGenerateStrategyService } from './report-generate-strategy.service.js';
import { REPORT_GENERATORS } from './report-generators-token.js';

const buildGenerator = (type: string): ReportGenerator =>
  ({ type, generate: vi.fn() }) as unknown as ReportGenerator;

describe('ReportGenerateStrategyService', () => {
  let service: ReportGenerateStrategyService;

  const eventGenerator = buildGenerator('event');
  const rulesGenerator = buildGenerator('rules');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportGenerateStrategyService,
        {
          provide: REPORT_GENERATORS,
          useValue: [eventGenerator, rulesGenerator],
        },
      ],
    }).compile();

    service = module.get<ReportGenerateStrategyService>(
      ReportGenerateStrategyService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStrategy', () => {
    it('should return the strategy registered for the given type', () => {
      // WHEN
      const strategy = service.getStrategy('rules');

      // THEN
      expect(strategy).toBe(rulesGenerator);
    });

    it('should throw an error when the report type is empty', () => {
      // WHEN / THEN
      expect(() => service.getStrategy('')).toThrow('Report type is required');
    });

    it('should throw an error when the report type is not supported', () => {
      // WHEN / THEN
      expect(() => service.getStrategy('unknown')).toThrow(
        'Unsupported report type: unknown',
      );
    });

    it('should keep the last generator when two of them share the same type', async () => {
      // GIVEN
      const duplicated = buildGenerator('event');

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ReportGenerateStrategyService,
          {
            provide: REPORT_GENERATORS,
            useValue: [eventGenerator, duplicated],
          },
        ],
      }).compile();

      const duplicatedService = module.get<ReportGenerateStrategyService>(
        ReportGenerateStrategyService,
      );

      // WHEN
      const strategy = duplicatedService.getStrategy('event');

      // THEN
      expect(strategy).toBe(duplicated);
    });
  });
});
