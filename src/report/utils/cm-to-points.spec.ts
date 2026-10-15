import { describe, expect, it } from 'vitest';
import { cmToPoints } from './cm-to-points.js';

describe('cmToPoints', () => {
  it('should convert centimeters to points', () => {
    // WHEN / THEN
    expect(cmToPoints(2.54)).toBeCloseTo(72, 5);
    expect(cmToPoints(1)).toBeCloseTo(28.3464567, 5);
  });

  it('should return 0 for 0 centimeters', () => {
    // WHEN / THEN
    expect(cmToPoints(0)).toBe(0);
  });
});
