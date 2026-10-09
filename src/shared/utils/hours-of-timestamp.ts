import { Temporal } from '@js-temporal/polyfill';

type HourMinuteOpt = 'numeric' | '2-digit';

interface HoursOfTimestampParams {
  timestamp?: number;
  locales?: string;
  hour12?: boolean;
  hour?: HourMinuteOpt;
  minute?: HourMinuteOpt;
  zoneId?: string;
}
export const hoursOfTimestamp = ({
  timestamp,
  hour12 = false,
  hour = '2-digit',
  minute = '2-digit',
  zoneId = 'UTC',
}: HoursOfTimestampParams) => {
  if (!timestamp) {
    return '';
  }

  const dateTemporal =
    Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(
      zoneId,
    );

  return dateTemporal.toLocaleString('en-US', {
    hour,
    minute,
    hour12,
  });
};
