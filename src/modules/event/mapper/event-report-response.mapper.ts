import { stringToObject } from '../../../shared/utils/string-to-object.js';
import { EventClientContent } from '../interfaces/event-client-response.interface.js';
import {
  EventReportResponse,
  EventReportVehicleOtherData,
} from '../interfaces/event-report-response.interface.js';

export const eventReportResponseMapper = (data: EventClientContent[] = []) =>
  data?.map((item): EventReportResponse => ({
    vehicles: item.vehicle.map((ve) => ve.name).join(', '),
    vehicleOtherData: stringToObject<EventReportVehicleOtherData>(
      item.vehicle[0]?.metadata,
    ),
    geofence: item.geofence.name,
    rule: item.rule?.name,
    ruleDescription: item.rule?.description,
    deviceImei: String(item.device.imei),
    deviceType: item.device.gpsspec_id,
    devicePosition: [item.lon, item.lat],
    date: item.date,
    eventName: item.type_name,
    inout: item.inout,
    conditionOperator: item.condition_operator,
    conditionValue: item.condition_value,
    devent: item.devent?.name,
    value: item.value,
  }));
