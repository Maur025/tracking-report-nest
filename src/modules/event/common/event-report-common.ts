import { EventReportResponse } from '../interfaces/event-report-response.interface.js';

const getEventDescription = (
  label: string,
  outConector: string,
  inConector: string,
  inout?: string,
) =>
  inout === 'out'
    ? `Salió ${outConector} ${label}`
    : inout === 'in'
      ? `Ingresó ${inConector} ${label}`
      : `Ingresó/Salió ${outConector} ${label}`;

const caseIpoints = (inout?: string, geofence?: string) => {
  const description = getEventDescription(
    'punto de interés',
    'del',
    'al',
    inout,
  );

  return {
    eventName: 'Puntos de Interés',
    eventDetail: `${description} ${geofence ?? 'N/A'}`,
  };
};

const caseGeofences = (inout?: string, geofence?: string) => {
  const description = getEventDescription('geocerca', 'de la', 'a la', inout);

  return {
    eventName: 'Geocerca',
    eventDetail: `${description} ${geofence ?? 'N/A'}`,
  };
};

const caseSensors = (
  devent?: string,
  conditionOperator?: string | null,
  conditionValue?: string | null,
  value?: string | null,
) => ({
  eventName: 'Sensor',
  eventDetail: `${devent} ${conditionOperator} ${conditionValue ?? 'N/A'}, con el valor ${value ?? 'N/A'}`,
});

export const getEventValues = ({
  eventName,
  inout,
  geofence,
  conditionOperator,
  conditionValue,
  devent,
  value,
}: EventReportResponse) => {
  switch (eventName) {
    case 'IPOINTS': {
      return caseIpoints(inout, geofence);
    }
    case 'GEOFENCES': {
      return caseGeofences(inout, geofence);
    }
    case 'SENSORS': {
      return caseSensors(devent, conditionOperator, conditionValue, value);
    }
    default: {
      return { eventName: 'N/A', eventDetail: 'N/A' };
    }
  }
};
