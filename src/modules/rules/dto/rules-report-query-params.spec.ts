import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { RulesReportQueryParams } from './rules-report-query-params.js';

describe('RulesReportQueryParams', () => {
  it.each(['type', 'frequencyWeekday'] as const)(
    'should wrap a single %s value into an array',
    (field) => {
      // WHEN
      const dto = plainToInstance(RulesReportQueryParams, {
        [field]: 'value',
      });

      // THEN
      expect(dto[field]).toEqual(['value']);
    },
  );

  it('should keep arrays as-is', () => {
    // WHEN
    const dto = plainToInstance(RulesReportQueryParams, {
      type: ['SENSORS', 'GEOFENCES'],
    });

    // THEN
    expect(dto.type).toEqual(['SENSORS', 'GEOFENCES']);
  });
});
