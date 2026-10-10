import {
  Geofence,
  Notification,
  Vehicle,
} from './rules-client-response.interface.js';

export interface RulesReportFrequency {
  startTime?: number;
  endTime?: number;
  frequencyValue?: number;
}

export interface RulesReportResponse {
  type?: string;
  name?: string;
  alerts?: string[];
  notifications?: Notification[];
  vehicles?: Vehicle[];
  groups?: any[];
  frequency?: RulesReportFrequency[];
  geofences?: Geofence[];
  interestPoints?: Geofence[];
  sensors?: any[];
}
