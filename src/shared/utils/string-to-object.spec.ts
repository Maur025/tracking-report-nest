import { describe, expect, it } from 'vitest';
import { stringToObject } from './string-to-object.js';

describe('stringToObject', () => {
  it('should parse a valid JSON string', () => {
    // GIVEN
    const value = '{"plaque":"ABC123"}';

    // WHEN
    const result = stringToObject<{ plaque: string }>(value);

    // THEN
    expect(result).toEqual({ plaque: 'ABC123' });
  });

  it('should return undefined for an empty or missing string', () => {
    // WHEN / THEN
    expect(stringToObject('')).toBeUndefined();
    expect(stringToObject(undefined as unknown as string)).toBeUndefined();
  });

  it('should return undefined when the JSON is invalid', () => {
    // WHEN
    const result = stringToObject('{invalid-json}');

    // THEN
    expect(result).toBeUndefined();
  });
});
