import { getWeekday } from '../../../shared/utils/get-weekday.js';
import { hoursOfTimestamp } from '../../../shared/utils/hours-of-timestamp.js';
import {
  Geofence,
  Notification,
  Vehicle,
} from '../interfaces/rules-client-response.interface.js';
import { RulesReportFrequency } from '../interfaces/rules-report-response.interface.js';

export const getRuleType = (value?: string): string => {
  switch (value) {
    case 'GEOFENCES':
      return 'Geocerca';
    case 'SENSORS':
      return 'Sensor';
    default:
      return 'N/A';
  }
};

export const getRuleName = (nameValue?: string, typeValue?: string) => {
  const type = getRuleType(typeValue);

  return nameValue ? `${nameValue} (${type})` : `N/A (${type})`;
};

export const getFrequencies = (
  values: RulesReportFrequency[] = [],
  zoneId = 'UTC',
): string => {
  if (!Array.isArray(values) || values.length === 0) {
    return 'N/A';
  }

  return values
    .map(
      (frequency) =>
        `${getWeekday(frequency.frequencyValue)} (${hoursOfTimestamp({ timestamp: frequency.startTime, zoneId })} - ${hoursOfTimestamp({ timestamp: frequency.endTime, zoneId })})`,
    )
    .join('\n');
};

const getCount = <T>(value: T[] = []): string => {
  if (!Array.isArray(value) || value.length === 0) {
    return '0';
  }

  return `${value.length}`;
};

export const getRuleEvents = (
  alerts: string[] = [],
  notifications: Notification[] = [],
) => {
  return `Alertas: ${getCount(alerts)}\nNotificaciones: ${getCount(notifications)}`;
};

export const getRuleScope = (groups: any[] = [], vehicles: Vehicle[] = []) => {
  return `Grupos: ${getCount(groups)}\nVehículos: ${getCount(vehicles)}`;
};

export const getRuleOperationalContext = (
  geofences: Geofence[] = [],
  interestPoints: Geofence[] = [],
  sensors: any[] = [],
) => {
  return `Geocercas: ${getCount(geofences)}\nPuntos de interés: ${getCount(interestPoints)}\nSensores: ${getCount(sensors)}`;
};
