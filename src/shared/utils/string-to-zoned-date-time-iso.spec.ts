import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it } from 'vitest';
import { stringToZonedDateTimeISO } from './string-to-zoned-date-time-iso.js';

describe('stringToZonedDateTimeISO', () => {
  it('should convert an ISO string into a zoned date time', () => {
    // GIVEN
    const value = '2023-01-01T00:00:00Z';

    // WHEN
    const result = stringToZonedDateTimeISO({ value });

    // THEN
    expect(result).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(result?.epochMilliseconds).toBe(1672531200000);
  });

  it('should apply the provided timezone', () => {
    // WHEN
    const result = stringToZonedDateTimeISO(
      { value: '2023-01-01T00:00:00Z' },
      'America/Bogota',
    );

    // THEN
    expect(result?.hour).toBe(19);
    expect(result?.timeZoneId).toBe('America/Bogota');
  });

  it('should return undefined when there is no value', () => {
    // WHEN / THEN
    expect(stringToZonedDateTimeISO({})).toBeUndefined();
    expect(stringToZonedDateTimeISO({ value: '' })).toBeUndefined();
  });

  it('should return undefined when the value is not a string', () => {
    // WHEN / THEN
    expect(stringToZonedDateTimeISO({ value: 123 })).toBeUndefined();
    expect(stringToZonedDateTimeISO({ value: {} })).toBeUndefined();
  });
});
