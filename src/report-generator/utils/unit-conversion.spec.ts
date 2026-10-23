import { describe, expect, it } from 'vitest';
import { cmToPoints } from './cm-to-points.js';
import { unitConversion } from './unit-conversion.js';

describe('unitConversion', () => {
  it('should convert centimeters to points', () => {
    // WHEN
    const result = unitConversion(2.54, 'cm');

    // THEN
    expect(result).toBeCloseTo(cmToPoints(2.54), 5);
  });

  it('should keep the value when the unit is already points', () => {
    // WHEN / THEN
    expect(unitConversion(72, 'pt')).toBe(72);
  });
});
