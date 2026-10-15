import { formatDateOfTimestamp } from '../../../shared/utils/format-date-of-timestamp.js';

export const getDate = (value?: number, zoneId: string = 'UTC'): string => {
  return value ? formatDateOfTimestamp({ timestamp: value, zoneId }) : 'N/A';
};

export const getVehicleName = (value?: string): string => {
  return value ?? 'N/A';
};

export const getProgressValue = (value?: number): string => {
  return `${value ?? '0'} %`;
};

export const getItemProgressName = (
  nameValue?: string,
  frequencyValue?: string,
): string => {
  const frequencyType = getTypeFrequency(frequencyValue);

  return `${nameValue ?? 'N/A'} (${frequencyType})`;
};

export const getTypeFrequency = (value?: string): string => {
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

export const getTypeProgress = (value?: string): string => {
  switch (value) {
    case 'ROUTE':
      return 'Ruta';
    case 'GEOFENCES':
      return 'Geocerca';
    case 'POINT':
      return 'Punto de Interés';
    default: {
      return 'N/A';
    }
  }
};
