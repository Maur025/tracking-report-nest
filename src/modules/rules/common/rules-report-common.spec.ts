import { describe, expect, it } from 'vitest';
import {
  getFrequencies,
  getRuleEvents,
  getRuleName,
  getRuleOperationalContext,
  getRuleScope,
  getRuleType,
} from './rules-report-common.js';

// 2023-01-01T00:00:00Z and 2023-01-01T04:00:00Z
const START = 1672531200000;
const END = 1672545600000;

describe('getRuleType', () => {
  it('should translate the known rule types', () => {
    // WHEN / THEN
    expect(getRuleType('GEOFENCES')).toBe('Geocerca');
    expect(getRuleType('SENSORS')).toBe('Sensor');
    expect(getRuleType('OTHER')).toBe('N/A');
    expect(getRuleType()).toBe('N/A');
  });
});

describe('getRuleName', () => {
  it('should compose the name with the translated type', () => {
    // WHEN
    const result = getRuleName('Exceso de velocidad', 'SENSORS');

    // THEN
    expect(result).toBe('Exceso de velocidad (Sensor)');
  });

  it('should fall back to N/A when there is no name', () => {
    // WHEN
    const result = getRuleName(undefined, 'GEOFENCES');

    // THEN
    expect(result).toBe('N/A (Geocerca)');
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

  it('should return N/A when there are no frequencies', () => {
    // WHEN / THEN
    expect(getFrequencies()).toBe('N/A');
    expect(getFrequencies([])).toBe('N/A');
  });
});

describe('getRuleEvents', () => {
  it('should count alerts and notifications', () => {
    // WHEN
    const result = getRuleEvents(['a', 'b'], [{ id: 'n1' }]);

    // THEN
    expect(result).toBe('Alertas: 2\nNotificaciones: 1');
  });

  it('should report zero when empty', () => {
    // WHEN
    const result = getRuleEvents();

    // THEN
    expect(result).toBe('Alertas: 0\nNotificaciones: 0');
  });
});

describe('getRuleScope', () => {
  it('should count groups and vehicles', () => {
    // WHEN
    const result = getRuleScope([1], [1, 2]);

    // THEN
    expect(result).toBe('Grupos: 1\nVehículos: 2');
  });
});

describe('getRuleOperationalContext', () => {
  it('should count geofences, interest points and sensors', () => {
    // WHEN
    const result = getRuleOperationalContext([1], [1, 2], [1, 2, 3]);

    // THEN
    expect(result).toBe(
      'Geocercas: 1\nPuntos de interés: 2\nSensores: 3',
    );
  });
});
