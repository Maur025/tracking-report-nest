import { Temporal } from '@js-temporal/polyfill';
import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { ReportParamWithDateDto } from './report-param-with-date.dtoc.js';

describe('ReportParamWithDateDto', () => {
  it('should transform an ISO date string into a zoned date time', () => {
    // WHEN
    const dto = plainToInstance(ReportParamWithDateDto, {
      date: '2023-01-01T00:00:00Z',
    });

    // THEN
    expect(dto.date).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(dto.date?.epochMilliseconds).toBe(1672531200000);
  });

  it('should transform every date field', () => {
    // GIVEN
    const value = '2023-01-01T00:00:00Z';

    // WHEN
    const dto = plainToInstance(ReportParamWithDateDto, {
      date: value,
      fromDate: value,
      toDate: value,
      monthDate: value,
      yearDate: value,
    });

    // THEN
    for (const field of [
      'date',
      'fromDate',
      'toDate',
      'monthDate',
      'yearDate',
    ] as const) {
      expect(dto[field]).toBeInstanceOf(Temporal.ZonedDateTime);
    }
  });

  it('should keep date fields undefined when they are not provided', () => {
    // WHEN
    const dto = plainToInstance(ReportParamWithDateDto, {});

    // THEN
    expect(dto.date).toBeUndefined();
    expect(dto.fromDate).toBeUndefined();
  });

  it('should keep the zone id as a plain string', () => {
    // WHEN
    const dto = plainToInstance(ReportParamWithDateDto, {
      zoneId: 'America/Bogota',
    });

    // THEN
    expect(dto.zoneId).toBe('America/Bogota');
  });
});
