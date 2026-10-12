import { describe, expect, it } from 'vitest';
import type { EventReportResponse } from '../interfaces/event-report-response.interface.js';
import { getEventValues } from './event-report-common.js';

const buildEvent = (event?: Partial<EventReportResponse>) =>
  ({ ...event }) as EventReportResponse;

describe('getEventValues', () => {
  it('should describe an interest point entrance', () => {
    // GIVEN
    const event = buildEvent({
      eventName: 'IPOINTS',
      inout: 'in',
      geofence: 'Bodega Central',
    });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result).toEqual({
      eventName: 'Puntos de Interés',
      eventDetail: 'Ingresó al punto de interés Bodega Central',
    });
  });

  it('should describe a geofence exit', () => {
    // GIVEN
    const event = buildEvent({
      eventName: 'GEOFENCES',
      inout: 'out',
      geofence: 'Zona Norte',
    });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result).toEqual({
      eventName: 'Geocerca',
      eventDetail: 'Salió de la geocerca Zona Norte',
    });
  });

  it('should describe an undetermined in/out movement', () => {
    // GIVEN
    const event = buildEvent({ eventName: 'GEOFENCES', geofence: 'Zona Sur' });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result).toEqual({
      eventName: 'Geocerca',
      eventDetail: 'Ingresó/Salió de la geocerca Zona Sur',
    });
  });

  it('should fall back to N/A when the geofence is missing', () => {
    // GIVEN
    const event = buildEvent({ eventName: 'IPOINTS', inout: 'in' });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result.eventDetail).toContain('N/A');
  });

  it('should describe a sensor event with its condition and value', () => {
    // GIVEN
    const event = buildEvent({
      eventName: 'SENSORS',
      devent: 'Temperatura',
      conditionOperator: '>',
      conditionValue: '30',
      value: '35',
    });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result).toEqual({
      eventName: 'Sensor',
      eventDetail: 'Temperatura > 30, con el valor 35',
    });
  });

  it('should fall back to N/A for missing sensor values', () => {
    // GIVEN
    const event = buildEvent({ eventName: 'SENSORS' });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result.eventDetail).toBe('undefined undefined N/A, con el valor N/A');
  });

  it('should return N/A for unknown event types', () => {
    // GIVEN
    const event = buildEvent({ eventName: 'UNKNOWN' });

    // WHEN
    const result = getEventValues(event);

    // THEN
    expect(result).toEqual({ eventName: 'N/A', eventDetail: 'N/A' });
  });
});
