export interface RulesClientResponse {
  content: RulesClientContentResponse[];
  pagination: Pagination;
}

export interface RulesClientContentResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  inout: string;
  enabled: number;
  deleted: number;
  alerts: Alert[];
  frequency: Frequency[];
  events: Event[];
  groups: any[];
  vehicles: Vehicle[];
  notifications: Notification[];
  geofences: Geofence[];
  ipoints: Geofence[];
  sensors: any[];
}

export interface Alert {
  id: string;
  name: string;
  color: string;
  rule_id: string;
  sound_id: string;
}

export interface Event {
  id: string;
  rule_id: string;
  rule: Rule;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: string;
  inout: string;
  enabled: number;
  deleted: number;
}

export interface Frequency {
  id: string;
  rule_id: string;
  start_time: number;
  end_time: number;
  frequency: string;
  rule: Rule;
}

export interface Geofence {
  id: string;
  rule_id: string;
  geofence_id: string;
  inout: string;
}

export interface Notification {
  id: string;
  rule_id: string;
  channel_id: string;
  channel_data: string;
}

export interface Vehicle {
  id: string;
  rule_id: string;
  vehicle_id: string;
}

export interface Pagination {
  pages: number;
  rowsNumber: number;
}
