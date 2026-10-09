import { getWeekday } from '../../../shared/utils/get-weekday.js';
import { hoursOfTimestamp } from '../../../shared/utils/hours-of-timestamp.js';
import { Vehicle } from '../interfaces/progress-client-response.interface.js';
import {
  ProgressReportFrequency,
  ProgressReportRoute,
} from '../interfaces/progress-report-response.interface.js';

export const getProgressType = (value?: string): string => {
  switch (value) {
    case 'GEOFENCES':
      return 'Geocerca';
    case 'ROUTE':
      return 'Ruta';
    case 'IPOINT':
      return 'Punto de interés';
    default:
      return 'N/A';
  }
};

export const getFrequencyType = (value?: string): string => {
  switch (value) {
    case 'DIARY':
      return 'Diario';
    case 'WEEKLY':
      return 'Semanal';
    case 'MONTHLY':
      return 'Mensual';
    default:
      return 'N/A';
  }
};

export const getProgressName = (
  nameValue?: string,
  typeValue?: string,
  frequencyTypeValue?: string,
) => {
  const progressType = getProgressType(typeValue);
  const frequencyType = getFrequencyType(frequencyTypeValue);

  return nameValue
    ? `${nameValue} (${progressType}, ${frequencyType})`
    : `N/A (${progressType}, ${frequencyType})`;
};

export const getFrequencies = (
  values: ProgressReportFrequency[] = [],
  zoneId: string = 'UTC',
) => {
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

const getCount = <T>(value: T[] = []) => {
  if (!Array.isArray(value) || value.length === 0) {
    return '0';
  }

  return `${value.length}`;
};

export const getProgressScope = (
  groups: any[] = [],
  vehicles: Vehicle[] = [],
): string => {
  return `Grupos: ${getCount(groups)}\nVehículos: ${getCount(vehicles)}`;
};

const getRouteName = (route: ProgressReportRoute) => {
  return route.name ?? 'N/A';
};

export const getProgressOperationalContext = (
  route: ProgressReportRoute = {},
  geofences: any[] = [],
  interestPoints: any[] = [],
) => {
  const routeName = getRouteName(route);

  if (routeName === 'N/A') {
    return `Geocercas: ${getCount(geofences)}\nPuntos de interés: ${getCount(interestPoints)}`;
  }

  return `Ruta: ${routeName}`;
};

export const getProgressRecords = (records: any[] = []) => {
  return getCount(records);
};
