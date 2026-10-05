export interface EventClientResponseDto {
  content: Content[];
  pagination: Pagination;
}

export interface Content {
  id: string;
  type_name: TypeName;
  device_id: string;
  vehicle_id: string;
  date: number;
  date_end: null;
  value: null;
  value_end: null;
  lat: number;
  lon: number;
  lat_end: null;
  lon_end: null;
  rule_id: string;
  sensor_id: null;
  rule_devent_id: null;
  devent_id: null;
  rule_geofence_id: string;
  inout: ContentInout;
  geofence_id: string;
  condition_operator: null;
  condition_value: null;
  device: Device;
  rule?: Rule;
  rule_geofence: RuleGeofence;
  vehicle: Vehicle[];
  geofence: Geofence;
}

export interface Device {
  id: number;
  info_brand: InfoBrand;
  info_device: null;
  info_manufacturer: null;
  info_model: InfoModel;
  info_product: null;
  info_serial: null;
  info_fingerprint: null;
  config_internettest: null;
  config_livecapture: null;
  config_paramupdate: null;
  config_saveoffline: null;
  config_saveonline: null;
  config_serverapi: null;
  config_servertrack: null;
  config_trackcapture: null;
  config_updatestatus: null;
  registred: string;
  registred_date: null;
  last_connect: number;
  first_connect: number;
  imei: number;
  phone_number: null;
  gpsspec_id: GpsspecID;
  timezone: null;
  sendtype: null;
  sendtime: null;
  senddistance: null;
}

export enum GpsspecID {
  GpsTrackerC756 = 'gps-tracker-c756',
  Gs405C = 'GS-405C',
}

export enum InfoBrand {
  GPSTracker = 'GPS Tracker',
  H02 = 'H02',
}

export enum InfoModel {
  Gps405C = 'GPS-405C',
  H02 = 'H02',
}

export interface Geofence {
  id: string;
  layer_id: string;
  name: string;
  description: string;
  color: Color;
  icon: null;
  coords: string;
  data: string;
  deleted: number;
}

export enum Color {
  F57C00 = '#f57c00',
  The00Acc1 = '#00acc1',
  The7B1Fa2 = '#7b1fa2',
}

export enum ContentInout {
  In = 'in',
  Out = 'out',
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: string;
  inout: RuleInout;
  enabled: number;
  deleted: number;
}

export enum RuleInout {
  Inout = 'inout',
}

export interface RuleGeofence {
  id: string;
  rule_id: string;
  geofence_id: string;
  inout: RuleInout;
}

export enum TypeName {
  Geofences = 'GEOFENCES',
}

export interface Vehicle {
  id: string;
  name: Name;
  type: Type;
  metadata: string;
}

export enum Name {
  Tucson = 'Tucson',
  V101 = 'V-101',
}

export enum Type {
  Motorizado = 'Motorizado',
}

export interface Pagination {
  pages: number;
  rowsNumber: number;
}
