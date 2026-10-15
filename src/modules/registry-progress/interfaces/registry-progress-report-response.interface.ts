export interface RegistryProgressReportResponse {
  type?: string;
  vehicle?: string;
  progressFrequencyType?: string;
  progressName?: string;
  progressValue?: number;
  dateFrom?: number;
  dateTo?: number;
}
