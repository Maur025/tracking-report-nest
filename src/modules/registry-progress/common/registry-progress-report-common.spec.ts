import { describe, expect, it } from 'vitest';
import {
  getDate,
  getItemProgressName,
  getProgressValue,
  getTypeFrequency,
  getTypeProgress,
  getVehicleName,
} from './registry-progress-report-common.js';

// 2023-01-01T00:00:00Z
const TIMESTAMP = 1672531200000;

describe('getDate', () => {
  it('should format the timestamp applying the timezone', () => {
    // WHEN / THEN
    expect(getDate(TIMESTAMP)).toBe('01/01/2023, 00:00');
    expect(getDate(TIMESTAMP, 'America/Bogota')).toBe('31/12/2022, 19:00');
  });

  it('should return N/A when there is no value', () => {
    // WHEN / THEN
    expect(getDate(undefined)).toBe('N/A');
    expect(getDate(0)).toBe('N/A');
  });
});

describe('getVehicleName', () => {
  it('should keep the vehicle name', () => {
    // WHEN / THEN
    expect(getVehicleName('Tucson')).toBe('Tucson');
  });

  it('should return N/A when there is no name', () => {
    // WHEN / THEN
    expect(getVehicleName()).toBe('N/A');
  });
});

describe('getProgressValue', () => {
  it('should append a percentage sign', () => {
    // WHEN / THEN
    expect(getProgressValue(75)).toBe('75 %');
  });

  it('should fall back to 0 % when there is no value', () => {
    // WHEN / THEN
    expect(getProgressValue()).toBe('0 %');
  });
});

describe('getItemProgressName', () => {
  it('should compose the name with the translated frequency', () => {
    // WHEN
    const result = getItemProgressName('Progreso semanal', 'WEEKLY');

    // THEN
    expect(result).toBe('Progreso semanal (Semanal)');
  });

  it('should fall back to N/A when there is no name', () => {
    // WHEN
    const result = getItemProgressName(undefined, 'UNKNOWN');

    // THEN
    expect(result).toBe('N/A (N/A)');
  });
});

describe('getTypeFrequency', () => {
  it('should translate the known frequency types', () => {
    // WHEN / THEN
    expect(getTypeFrequency('DIARY')).toBe('Diario');
    expect(getTypeFrequency('WEEKLY')).toBe('Semanal');
    expect(getTypeFrequency('MONTHLY')).toBe('Mensual');
    expect(getTypeFrequency('OTHER')).toBe('N/A');
  });
});

describe('getTypeProgress', () => {
  it('should translate the known progress types', () => {
    // WHEN / THEN
    expect(getTypeProgress('ROUTE')).toBe('Ruta');
    expect(getTypeProgress('GEOFENCES')).toBe('Geocerca');
    expect(getTypeProgress('POINT')).toBe('Punto de Interés');
    expect(getTypeProgress('OTHER')).toBe('N/A');
  });
});
