export interface EventReportVehicleOtherData {
  plaque?: string;
}

export interface EventReportResponse {
  vehicles?: string;
  geofence?: string;
  rule?: string;
  ruleDescription?: string;
  deviceImei?: string;
  deviceType?: string;
  devicePosition?: [number, number];
  date?: number;
  eventName?: string;
  inout?: string;
  conditionOperator?: string | null;
  conditionValue?: string | null;
  devent?: string;
  vehicleOtherData?: EventReportVehicleOtherData;
  value?: string | null;
}
