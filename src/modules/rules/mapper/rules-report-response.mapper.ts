import {
  Frequency,
  RulesClientContentResponse,
} from '../interfaces/rules-client-response.interface.js';
import {
  RulesReportFrequency,
  RulesReportResponse,
} from '../interfaces/rules-report-response.interface.js';
export const rulesReportResponseMapper = (
  data: RulesClientContentResponse[] = [],
) =>
  data.map((item): RulesReportResponse => ({
    type: item?.type,
    name: item?.name,
    alerts: item?.alerts?.map((alert) => alert?.name),
    notifications: item?.notifications,
    vehicles: item?.vehicles,
    groups: item?.groups,
    frequency: getFrequencyValues(item?.frequency),
    geofences: item?.geofences,
    interestPoints: item.ipoints,
    sensors: item.sensors,
  }));

const getFrequencyValues = (
  frequencies: Frequency[] = [],
): RulesReportFrequency[] => {
  if (!frequencies || !Array.isArray(frequencies) || frequencies.length <= 0) {
    return [];
  }

  return frequencies.map((frequency) => ({
    startTime: frequency?.start_time,
    endTime: frequency?.end_time,
    frequencyValue: frequency?.frequency
      ? Number(frequency.frequency)
      : undefined,
  }));
};
