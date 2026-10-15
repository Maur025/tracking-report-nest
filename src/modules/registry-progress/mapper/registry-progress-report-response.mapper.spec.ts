import { describe, expect, it } from 'vitest';
import type { RegistryProgressContent } from '../interfaces/registry-progress-client-response.interface.js';
import { registryProgressReportResponseMapper } from './registry-progress-report-response.mapper.js';

describe('registryProgressReportResponseMapper', () => {
  it('should map the external registry payload to the report shape', () => {
    // GIVEN
    const content = [
      {
        type: 'ROUTE',
        vehicle: [{ name: 'Camioneta Azul' }, { name: 'Tucson' }],
        progress: { frequency_type: 'WEEKLY', name: 'Progreso semanal' },
        value: '75',
        date_from: 1000,
        date_to: 2000,
      },
    ] as unknown as RegistryProgressContent[];

    // WHEN
    const [result] = registryProgressReportResponseMapper(content);

    // THEN
    expect(result.type).toBe('ROUTE');
    expect(result.vehicle).toBe('Camioneta Azul, Tucson');
    expect(result.progressFrequencyType).toBe('WEEKLY');
    expect(result.progressName).toBe('Progreso semanal');
    expect(result.progressValue).toBe(75);
    expect(result.dateFrom).toBe(1000);
    expect(result.dateTo).toBe(2000);
  });

  it('should fall back to 0 when the progress value is not a number', () => {
    // GIVEN
    const content = [
      { value: 'not-a-number' },
      { value: undefined },
    ] as unknown as RegistryProgressContent[];

    // WHEN
    const results = registryProgressReportResponseMapper(content);

    // THEN
    expect(results[0].progressValue).toBe(0);
    expect(results[1].progressValue).toBe(0);
  });

  it('should return an empty array when there is no content', () => {
    // WHEN / THEN
    expect(registryProgressReportResponseMapper()).toEqual([]);
  });
});
