import { describe, expect, it } from 'vitest';
import {
  getFrequencies,
  getProgressName,
  getProgressOperationalContext,
  getProgressRecords,
  getProgressScope,
  getProgressType,
  getFrequencyType,
} from './progress-report-common.js';

// 2023-01-01T00:00:00Z and 2023-01-01T04:00:00Z
const START = 1672531200000;
const END = 1672545600000;

describe('getProgressType', () => {
  it('should translate the known progress types', () => {
    // WHEN / THEN
    expect(getProgressType('GEOFENCES')).toBe('Geocerca');
    expect(getProgressType('ROUTE')).toBe('Ruta');
    expect(getProgressType('IPOINT')).toBe('Punto de interés');
  });

  it('should return N/A for unknown or missing types', () => {
    // WHEN / THEN
    expect(getProgressType('OTHER')).toBe('N/A');
    expect(getProgressType()).toBe('N/A');
  });
});

describe('getFrequencyType', () => {
  it('should translate the known frequency types', () => {
    // WHEN / THEN
    expect(getFrequencyType('DIARY')).toBe('Diario');
    expect(getFrequencyType('WEEKLY')).toBe('Semanal');
    expect(getFrequencyType('MONTHLY')).toBe('Mensual');
  });

  it('should return N/A for unknown or missing frequency types', () => {
    // WHEN / THEN
    expect(getFrequencyType('OTHER')).toBe('N/A');
    expect(getFrequencyType()).toBe('N/A');
  });
});

describe('getProgressName', () => {
  it('should compose the name with the translated type and frequency', () => {
    // WHEN
    const result = getProgressName('Ruta escolar', 'ROUTE', 'DIARY');

    // THEN
    expect(result).toBe('Ruta escolar (Ruta, Diario)');
  });

  it('should fall back to N/A when there is no name', () => {
    // WHEN
    const result = getProgressName(undefined, 'ROUTE', 'DIARY');

    // THEN
    expect(result).toBe('N/A (Ruta, Diario)');
  });
});

describe('getFrequencies', () => {
  it('should list each frequency with weekday and time range', () => {
    // GIVEN
    const values = [{ startTime: START, endTime: END, frequencyValue: 1 }];

    // WHEN
    const result = getFrequencies(values);

    // THEN
    expect(result).toBe('Lunes (00:00 - 04:00)');
  });

  it('should join multiple frequencies with a new line', () => {
    // GIVEN
    const values = [
      { startTime: START, endTime: END, frequencyValue: 1 },
      { startTime: START, endTime: END, frequencyValue: 2 },
    ];

    // WHEN
    const result = getFrequencies(values);

    // THEN
    expect(result.split('\n')).toEqual(['Lunes (00:00 - 04:00)', 'Martes (00:00 - 04:00)']);
  });

  it('should return N/A when there are no frequencies', () => {
    // WHEN / THEN
    expect(getFrequencies()).toBe('N/A');
    expect(getFrequencies([])).toBe('N/A');
  });
});

describe('getProgressScope', () => {
  it('should count groups and vehicles', () => {
    // WHEN
    const result = getProgressScope([1, 2], [1, 2, 3]);

    // THEN
    expect(result).toBe('Grupos: 2\nVehículos: 3');
  });

  it('should report zero when empty', () => {
    // WHEN
    const result = getProgressScope();

    // THEN
    expect(result).toBe('Grupos: 0\nVehículos: 0');
  });
});

describe('getProgressOperationalContext', () => {
  it('should show the route when present', () => {
    // WHEN
    const result = getProgressOperationalContext({ name: 'Ruta 1' });

    // THEN
    expect(result).toBe('Ruta: Ruta 1');
  });

  it('should count geofences and interest points when there is no route', () => {
    // WHEN
    const result = getProgressOperationalContext({}, [1], [1, 2]);

    // THEN
    expect(result).toBe('Geocercas: 1\nPuntos de interés: 2');
  });
});

describe('getProgressRecords', () => {
  it('should count the records', () => {
    // WHEN / THEN
    expect(getProgressRecords([1, 2, 3])).toBe('3');
    expect(getProgressRecords()).toBe('0');
  });
});
