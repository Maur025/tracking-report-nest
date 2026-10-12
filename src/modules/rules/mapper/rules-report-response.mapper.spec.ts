import { describe, expect, it } from 'vitest';
import type { RulesClientContentResponse } from '../interfaces/rules-client-response.interface.js';
import { rulesReportResponseMapper } from './rules-report-response.mapper.js';

describe('rulesReportResponseMapper', () => {
  it('should map alerts, frequency and the remaining rule fields', () => {
    // GIVEN
    const content = [
      {
        type: 'GEOFENCES',
        name: 'Control de zona',
        alerts: [{ name: 'Alerta 1' }, { name: 'Alerta 2' }],
        notifications: [{ id: 'n1' }],
        vehicles: ['v1'],
        groups: ['g1'],
        frequency: [{ start_time: 1, end_time: 2, frequency: '4' }],
        geofences: ['f1'],
        ipoints: ['p1'],
        sensors: ['s1'],
      },
    ] as unknown as RulesClientContentResponse[];

    // WHEN
    const [result] = rulesReportResponseMapper(content);

    // THEN
    expect(result.type).toBe('GEOFENCES');
    expect(result.name).toBe('Control de zona');
    expect(result.alerts).toEqual(['Alerta 1', 'Alerta 2']);
    expect(result.frequency).toEqual([
      { startTime: 1, endTime: 2, frequencyValue: 4 },
    ]);
    expect(result.notifications).toEqual([{ id: 'n1' }]);
    expect(result.interestPoints).toEqual(['p1']);
    expect(result.sensors).toEqual(['s1']);
  });

  it('should return an empty frequency list when there is none', () => {
    // GIVEN
    const content = [{ frequency: [] }] as unknown as RulesClientContentResponse[];

    // WHEN
    const [result] = rulesReportResponseMapper(content);

    // THEN
    expect(result.frequency).toEqual([]);
  });

  it('should return an empty array when there is no content', () => {
    // WHEN / THEN
    expect(rulesReportResponseMapper()).toEqual([]);
  });
});
