export interface ProgressClientResponse {
  content: ProgressClientContentResponse[];
  pagination: Pagination;
}

export interface ProgressClientContentResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  inout: string;
  usetrigger: number;
  frequency_type: string;
  route_id: string;
  enabled: number;
  deleted: number;
  tolerance_start: number;
  tolerance_end: number;
  frequency: Frequency[];
  groups: any[];
  vehicles: Vehicle[];
  geofences: any[];
  ipoints: any[];
  route: Route;
  registry: Registry[];
}

export interface Frequency {
  id: string;
  progress_id: string;
  start_time: number;
  end_time: number;
  frequency: string;
}

export interface Registry {
  id: string;
  type: string;
  device_id: number;
  vehicle_id: string;
  progress_id: string;
  inout: string;
  value: string;
  date_calc: null;
  calc_id: null;
  date_from: number;
  date_to: number;
  late: number;
  early: number;
}

export interface Route {
  id?: string;
  name?: string;
  description?: string;
  distance?: number;
  color?: string;
  min_split_mt?: number;
  max_split_mt?: number;
  district_id?: number;
  frequency?: string;
  create_date?: number;
  update_date?: string;
  start_lat?: number;
  start_lon?: number;
  end_lat?: number;
  end_lon?: number;
  district?: District;
  points?: Point[];
}

export interface District {
  id: number;
  name: string;
  color: string;
}

export interface Point {
  id: number;
  route_id: string;
  section: number;
  lat: number;
  lon: number;
}

export interface Vehicle {
  id: string;
  progress_id: string;
  vehicle_id: string;
}

export interface Pagination {
  pages: number;
  rowsNumber: number;
}
