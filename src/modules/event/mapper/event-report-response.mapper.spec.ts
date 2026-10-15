import { describe, expect, it } from 'vitest';
import type { EventClientContent } from '../interfaces/event-client-response.interface.js';
import { eventReportResponseMapper } from './event-report-response.mapper.js';

describe('eventReportResponseMapper', () => {
  it('should map the external event payload to the report shape', () => {
    // GIVEN
    const content = [
      {
        vehicle: [
          { name: 'Tucson', metadata: '{"plaque":"ABC123"}' },
          { name: 'V-101', metadata: '{}' },
        ],
        geofence: { name: 'Zona Norte' },
        rule: { name: 'Exceso de velocidad', description: 'Velocidad máxima' },
        device: { imei: 123456, gpsspec_id: 'gps-tracker-c756' },
        lon: -74.1,
        lat: 4.6,
        date: 1672531200000,
        type_name: 'GEOFENCES',
        inout: 'in',
        condition_operator: null,
        condition_value: null,
        devent: { name: 'Entrada' },
        value: '5',
      },
    ] as unknown as EventClientContent[];

    // WHEN
    const [result] = eventReportResponseMapper(content);

    // THEN
    expect(result.vehicles).toBe('Tucson, V-101');
    expect(result.vehicleOtherData).toEqual({ plaque: 'ABC123' });
    expect(result.geofence).toBe('Zona Norte');
    expect(result.rule).toBe('Exceso de velocidad');
    expect(result.ruleDescription).toBe('Velocidad máxima');
    expect(result.deviceImei).toBe('123456');
    expect(result.deviceType).toBe('gps-tracker-c756');
    expect(result.devicePosition).toEqual([-74.1, 4.6]);
    expect(result.date).toBe(1672531200000);
    expect(result.eventName).toBe('GEOFENCES');
    expect(result.inout).toBe('in');
    expect(result.devent).toBe('Entrada');
    expect(result.value).toBe('5');
  });

  it('should leave rule fields undefined when there is no rule', () => {
    // GIVEN
    const content = [
      {
        vehicle: [{ name: 'Tucson', metadata: undefined }],
        geofence: { name: 'Zona Sur' },
        device: { imei: 1, gpsspec_id: 'GS-405C' },
        lon: 0,
        lat: 0,
        date: 0,
        type_name: 'SENSORS',
      },
    ] as unknown as EventClientContent[];

    // WHEN
    const [result] = eventReportResponseMapper(content);

    // THEN
    expect(result.rule).toBeUndefined();
    expect(result.ruleDescription).toBeUndefined();
    expect(result.vehicleOtherData).toBeUndefined();
  });

  it('should return an empty array when there is no content', () => {
    // WHEN / THEN
    expect(eventReportResponseMapper()).toEqual([]);
    expect(eventReportResponseMapper(undefined)).toEqual([]);
  });
});
