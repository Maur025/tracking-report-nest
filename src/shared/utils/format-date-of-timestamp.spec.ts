import { describe, expect, it } from 'vitest';
import { formatDateOfTimestamp } from './format-date-of-timestamp.js';

// 2023-01-01T00:00:00Z
const JANUARY_FIRST_2023_UTC = 1672531200000;

describe('formatDateOfTimestamp', () => {
  it('should format a timestamp as numeric date-time by default', () => {
    // WHEN
    const result = formatDateOfTimestamp({
      timestamp: JANUARY_FIRST_2023_UTC,
    });

    // THEN
    expect(result).toBe('01/01/2023, 00:00');
  });

  it('should apply the provided timezone to the timestamp', () => {
    // WHEN
    const result = formatDateOfTimestamp({
      timestamp: JANUARY_FIRST_2023_UTC,
      zoneId: 'America/Bogota',
    });

    // THEN
    expect(result).toBe('31/12/2022, 19:00');
  });

  it('should expose the locale options for custom formatting', () => {
    // WHEN
    const result = formatDateOfTimestamp({
      timestamp: JANUARY_FIRST_2023_UTC,
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: undefined,
      minute: undefined,
    });

    // THEN
    expect(result).toContain('2023');
    expect(result).toContain('January');
  });

  it('should fall back to the current date when no timestamp is provided', () => {
    // WHEN
    const result = formatDateOfTimestamp({});

    // THEN
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/);
  });
});
