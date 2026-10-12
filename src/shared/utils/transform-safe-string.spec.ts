import { describe, expect, it } from 'vitest';
import { transformSafeString } from './transform-safe-string.js';

describe('transformSafeString', () => {
  it('should return an empty string for null or undefined', () => {
    // WHEN / THEN
    expect(transformSafeString(null)).toBe('');
    expect(transformSafeString(undefined)).toBe('');
  });

  it('should keep strings untouched', () => {
    // WHEN / THEN
    expect(transformSafeString('vehicle-123')).toBe('vehicle-123');
  });

  it('should convert numbers to string', () => {
    // WHEN / THEN
    expect(transformSafeString(42)).toBe('42');
  });

  it('should convert arrays to a comma separated string', () => {
    // WHEN
    const result = transformSafeString(['a', 'b']);

    // THEN
    expect(result).toBe('a,b');
  });

  it('should serialize objects as JSON', () => {
    // WHEN
    const result = transformSafeString({ id: 'abc' });

    // THEN
    expect(JSON.parse(result)).toEqual({ id: 'abc' });
  });
});
