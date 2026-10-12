import { describe, expect, it } from 'vitest';
import { getWeekday } from './get-weekday.js';

describe('getWeekday', () => {
  it('should map each weekday number to its Spanish name', () => {
    // GIVEN
    const expectedNames: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo',
    };

    // WHEN / THEN
    for (const [weekday, name] of Object.entries(expectedNames)) {
      expect(getWeekday(Number(weekday))).toBe(name);
    }
  });

  it('should return N/A for values outside the 1-7 range', () => {
    // WHEN / THEN
    expect(getWeekday(0)).toBe('N/A');
    expect(getWeekday(8)).toBe('N/A');
    expect(getWeekday(-1)).toBe('N/A');
  });

  it('should return N/A when no value is provided', () => {
    // WHEN / THEN
    expect(getWeekday()).toBe('N/A');
  });
});
