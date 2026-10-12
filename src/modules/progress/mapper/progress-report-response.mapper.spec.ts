import { describe, expect, it } from 'vitest';
import type { ProgressClientContentResponse } from '../interfaces/progress-client-response.interface.js';
import { progressReportResponseMapper } from './progress-report-response.mapper.js';

describe('progressReportResponseMapper', () => {
  it('should map frequencies and route from the external payload', () => {
    // GIVEN
    const content = [
      {
        type: 'ROUTE',
        name: 'Ruta escolar',
        frequency_type: 'DIARY',
        frequency: [
          { start_time: 1000, end_time: 2000, frequency: '3' },
          { start_time: 3000, end_time: 4000, frequency: '5' },
        ],
        groups: ['g1'],
        vehicles: ['v1'],
        route: { name: 'Ruta 1' },
        geofences: ['f1'],
        registry: [{ id: 'r1' }],
        ipoints: ['p1'],
      },
    ] as unknown as ProgressClientContentResponse[];

    // WHEN
    const [result] = progressReportResponseMapper(content);

    // THEN
    expect(result.type).toBe('ROUTE');
    expect(result.name).toBe('Ruta escolar');
    expect(result.frequencyType).toBe('DIARY');
    expect(result.frequencies).toEqual([
      { startTime: 1000, endTime: 2000, frequencyValue: 3 },
      { startTime: 3000, endTime: 4000, frequencyValue: 5 },
    ]);
    expect(result.route).toEqual({ name: 'Ruta 1' });
    expect(result.records).toEqual([{ id: 'r1' }]);
    expect(result.interestPoints).toEqual(['p1']);
  });

  it('should return an empty frequencies list when there is none', () => {
    // GIVEN
    const content = [{ frequency: [] }] as unknown as ProgressClientContentResponse[];

    // WHEN
    const [result] = progressReportResponseMapper(content);

    // THEN
    expect(result.frequencies).toEqual([]);
  });

  it('should omit the frequency value when it is not present', () => {
    // GIVEN
    const content = [
      { frequency: [{ start_time: 1, end_time: 2 }] },
    ] as unknown as ProgressClientContentResponse[];

    // WHEN
    const [result] = progressReportResponseMapper(content);

    // THEN
    expect(result.frequencies?.[0]).toEqual({
      startTime: 1,
      endTime: 2,
      frequencyValue: undefined,
    });
  });

  it('should return an empty route when it has no name', () => {
    // GIVEN
    const content = [{ route: {} }] as unknown as ProgressClientContentResponse[];

    // WHEN
    const [result] = progressReportResponseMapper(content);

    // THEN
    expect(result.route).toEqual({});
  });

  it('should return an empty array when there is no content', () => {
    // WHEN / THEN
    expect(progressReportResponseMapper()).toEqual([]);
  });
});
