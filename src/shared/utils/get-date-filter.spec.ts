import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it } from 'vitest';
import { getDateFilter } from './get-date-filter.js';

type DateFilterResult = { fromDate?: number; toDate?: number };

const zoned = (iso: string, zoneId = 'UTC') =>
  Temporal.Instant.from(iso).toZonedDateTimeISO(zoneId);

const toPlainDate = (epochMilliseconds?: number, zoneId = 'UTC') =>
  Temporal.Instant.fromEpochMilliseconds(epochMilliseconds!)
    .toZonedDateTimeISO(zoneId)
    .toPlainDate()
    .toString();

describe('getDateFilter', () => {
  it('should return the full day range between fromDate and toDate', () => {
    // GIVEN
    const from = zoned('2023-01-01T00:00:00Z');
    const to = zoned('2023-01-02T12:30:00Z');

    // WHEN
    const result = getDateFilter({ fromDate: from, toDate: to }) as DateFilterResult;

    // THEN
    expect(toPlainDate(result.fromDate)).toBe('2023-01-01');
    expect(toPlainDate(result.toDate)).toBe('2023-01-02');
    expect(result.toDate).toBeGreaterThan(result.fromDate!);
  });

  it('should throw when fromDate is greater than toDate', () => {
    // GIVEN
    const from = zoned('2023-01-02T00:00:00Z');
    const to = zoned('2023-01-01T00:00:00Z');

    // WHEN / THEN
    expect(() => getDateFilter({ fromDate: from, toDate: to })).toThrow(
      'fromDate must be less than or equal to toDate',
    );
  });

  it('should span the whole year when yearDate is provided', () => {
    // GIVEN
    const yearDate = zoned('2023-06-15T10:00:00Z');

    // WHEN
    const result = getDateFilter({ yearDate }) as DateFilterResult;

    // THEN
    expect(toPlainDate(result.fromDate)).toBe('2023-01-01');
    expect(toPlainDate(result.toDate)).toBe('2023-12-31');
  });

  it('should span the whole month when monthDate is provided', () => {
    // GIVEN
    const monthDate = zoned('2023-06-15T10:00:00Z');

    // WHEN
    const result = getDateFilter({ monthDate }) as DateFilterResult;

    // THEN
    expect(toPlainDate(result.fromDate)).toBe('2023-06-01');
    expect(toPlainDate(result.toDate)).toBe('2023-06-30');
  });

  it('should span the whole day when a single date is provided', () => {
    // GIVEN
    const date = zoned('2023-06-15T23:59:00Z');

    // WHEN
    const result = getDateFilter({ date }) as DateFilterResult;

    // THEN
    expect(toPlainDate(result.fromDate)).toBe('2023-06-15');
    expect(toPlainDate(result.toDate)).toBe('2023-06-15');
  });

  it('should respect the client timezone when computing day boundaries', () => {
    // GIVEN
    const zoneId = 'America/Bogota';
    const date = zoned('2023-06-15T02:00:00Z', zoneId);

    // WHEN
    const result = getDateFilter({ date, zoneId }) as DateFilterResult;

    // THEN
    expect(toPlainDate(result.fromDate, zoneId)).toBe('2023-06-14');
    expect(toPlainDate(result.toDate, zoneId)).toBe('2023-06-14');
  });

  it('should return an empty object when no date filter is provided', () => {
    // WHEN
    const result = getDateFilter({});

    // THEN
    expect(result).toEqual({});
  });
});
