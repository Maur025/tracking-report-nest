import { RegistryProgressContent } from '../interfaces/registry-progress-client-response.interface.js';
import { RegistryProgressReportResponse } from '../interfaces/registry-progress-report-response.interface.js';

export const registryProgressReportResponseMapper = (
  data: RegistryProgressContent[] = [],
): RegistryProgressReportResponse[] =>
  data.map((item) => ({
    type: item?.type,
    vehicle: item?.vehicle?.map((ve) => ve?.name).join(', '),
    progressFrequencyType: item?.progress?.frequency_type,
    progressName: item?.progress?.name,
    progressValue: isNaN(Number(item.value)) ? 0 : Number(item.value),
    dateFrom: item?.date_from,
    dateTo: item?.date_to,
  }));
