import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { EventReportQueryParams } from './event-report-query-params.js';

describe('EventReportQueryParams', () => {
  it('should wrap a single type value into an array', () => {
    // WHEN
    const dto = plainToInstance(EventReportQueryParams, { type: 'SENSORS' });

    // THEN
    expect(dto.type).toEqual(['SENSORS']);
  });

  it('should keep an array of types as-is', () => {
    // WHEN
    const dto = plainToInstance(EventReportQueryParams, {
      type: ['SENSORS', 'GEOFENCES'],
    });

    // THEN
    expect(dto.type).toEqual(['SENSORS', 'GEOFENCES']);
  });

  it('should inherit the base report params', () => {
    // WHEN
    const dto = plainToInstance(EventReportQueryParams, {
      databaseName: 'db',
      format: 'pdf',
    });

    // THEN
    expect(dto.databaseName).toBe('db');
    expect(dto.format).toBe('pdf');
    expect(dto.disposition).toBe('inline');
  });
});
