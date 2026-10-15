import {
  Frequency,
  ProgressClientContentResponse,
  Route,
} from '../interfaces/progress-client-response.interface.js';
import {
  ProgressReportFrequency,
  ProgressReportResponse,
  ProgressReportRoute,
} from '../interfaces/progress-report-response.interface.js';

export const progressReportResponseMapper = (
  data: ProgressClientContentResponse[] = [],
) =>
  data.map((item): ProgressReportResponse => ({
    type: item?.type,
    name: item?.name,
    frequencyType: item?.frequency_type,
    frequencies: getFrequencyValues(item?.frequency),
    groups: item?.groups,
    vehicles: item?.vehicles,
    route: getRoute(item?.route),
    geofences: item?.geofences,
    records: item?.registry,
    interestPoints: item.ipoints,
  }));

const getFrequencyValues = (
  frequencies: Frequency[] = [],
): ProgressReportFrequency[] => {
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

const getRoute = (route: Route = {}): ProgressReportRoute => {
  if (!route || !route.name) {
    return {};
  }

  return {
    name: route.name,
  };
};
