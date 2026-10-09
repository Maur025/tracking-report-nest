import { Vehicle } from '../interfaces/progress-client-response.interface.js';

export interface ProgressReportFrequency {
  startTime?: number;
  endTime?: number;
  frequencyValue?: number;
}

export interface ProgressReportRoute {
  name?: string;
}

export interface ProgressReportResponse {
  type?: string;
  name?: string;
  frequencyType?: string;
  frequencies?: ProgressReportFrequency[];
  groups?: any[];
  vehicles?: Vehicle[];
  route?: ProgressReportRoute;
  geofences?: any[];
  records?: any[];
  interestPoints?: any[];
}
