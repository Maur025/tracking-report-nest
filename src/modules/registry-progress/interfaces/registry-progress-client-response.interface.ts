export interface RegistryProgressClientResponse {
  content: RegistryProgressContent[];
  pagination: Pagination;
}

export interface RegistryProgressContent {
  id: string;
  type: ContentType;
  device_id: DeviceIDEnum | number;
  vehicle_id: string;
  progress_id: string;
  inout: Inout;
  value: string;
  date_calc: null;
  calc_id: null;
  date_from: number;
  date_to: number;
  late: null;
  early: null;
  device: Device;
  vehicle: Vehicle[];
  routes: Route[];
  geofences: Geofence[];
  ipoints: Geofence[];
  progress: any;
}

export interface Device {
  id: DeviceIDEnum | number;
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

export enum DeviceIDEnum {
  The222A31Ae0 = '222a31ae0',
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
  registry_progress_id: string;
  progress_geofence_id?: null | string;
  device_id: DeviceIDEnum;
  vehicle_id: string;
  inout: number;
  date: number | null;
  date_end: null;
  lat: number | null;
  lon: number | null;
  lat_end: null;
  lon_end: null;
  late: null;
  early: null;
  progress_ipoint_id?: null;
}

export enum Inout {
  Inout = 'inout',
}

export interface Route {
  id: string;
  registry_progress_id: string;
  route_id: string;
  device_id: string;
  vehicle_id: string;
  date: number;
  date_end: number;
  lat: number;
  lon: number;
  lat_end: number;
  lon_end: number;
  time_before_start: number;
  time_after_end: number;
  time_between: number;
  distance: number;
  distance_between: number;
  distance_before: number;
  distance_after: number;
  completed: number;
  late: null;
  early: null;
}

export enum ContentType {
  Geofences = 'GEOFENCES',
  Points = 'POINTS',
  Route = 'ROUTE',
}

export interface Vehicle {
  id: string;
  name: Name;
  type: VehicleType;
  metadata: string;
}

export enum Name {
  CamionetaAzul = 'Camioneta Azul',
  Tucson = 'Tucson',
}

export enum VehicleType {
  Motorizado = 'Motorizado',
}

export interface Pagination {
  pages: number;
  rowsNumber: number;
}
