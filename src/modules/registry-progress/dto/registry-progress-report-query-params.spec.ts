import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { RegistryProgressReportQueryParams } from './registry-progress-report-query-params.js';

describe('RegistryProgressReportQueryParams', () => {
  it.each(['type', 'vehicleId', 'progressId'] as const)(
    'should wrap a single %s value into an array',
    (field) => {
      // WHEN
      const dto = plainToInstance(RegistryProgressReportQueryParams, {
        [field]: 'value',
      });

      // THEN
      expect(dto[field]).toEqual(['value']);
    },
  );

  it('should keep arrays as-is', () => {
    // WHEN
    const dto = plainToInstance(RegistryProgressReportQueryParams, {
      type: ['ROUTE', 'GEOFENCES'],
    });

    // THEN
    expect(dto.type).toEqual(['ROUTE', 'GEOFENCES']);
  });
});
