import { describe, expect, it } from 'vitest';
import { hoursOfTimestamp } from './hours-of-timestamp.js';

// 2023-01-01T00:00:00Z
const JANUARY_FIRST_2023_UTC = 1672531200000;

describe('hoursOfTimestamp', () => {
  it('should return the time for a timestamp in the given timezone', () => {
    // WHEN
    const result = hoursOfTimestamp({
      timestamp: JANUARY_FIRST_2023_UTC,
      zoneId: 'America/Bogota',
    });

    // THEN
    expect(result).toBe('19:00');
  });

  it('should default to UTC', () => {
    // WHEN
    const result = hoursOfTimestamp({ timestamp: JANUARY_FIRST_2023_UTC });

    // THEN
    expect(result).toBe('00:00');
  });

  it('should return an empty string when there is no timestamp', () => {
    // WHEN / THEN
    expect(hoursOfTimestamp({})).toBe('');
    expect(hoursOfTimestamp({ timestamp: 0 })).toBe('');
  });
});
