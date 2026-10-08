import { Temporal } from '@js-temporal/polyfill';

type YearDayHourMinuteOpt = 'numeric' | '2-digit';
type MonthOpt = 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';

interface FormatDateOfTimestampParams {
  timestamp?: number;
  locales?: string;
  hour12?: boolean;
  year?: YearDayHourMinuteOpt;
  month?: MonthOpt;
  day?: YearDayHourMinuteOpt;
  hour?: YearDayHourMinuteOpt;
  minute?: YearDayHourMinuteOpt;
  zoneId?: string;
}

export const formatDateOfTimestamp = ({
  timestamp,
  locales = 'en-US',
  hour12 = false,
  year = 'numeric',
  month = '2-digit',
  day = '2-digit',
  hour = '2-digit',
  minute = '2-digit',
  zoneId = 'UTC',
}: FormatDateOfTimestampParams): string => {
  const dateTemporal = timestamp
    ? getTemporalOfTimestamp(timestamp, zoneId)
    : getNewTemporal(zoneId);

  return dateTemporal.toLocaleString(locales, {
    hour12,
    year,
    month,
    day,
    hour,
    minute,
  });
};

const getTemporalOfTimestamp = (
  timestamp: number,
  zoneId: string = 'UTC',
): Temporal.ZonedDateTime =>
  Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(zoneId);

const getNewTemporal = (zoneId: string = 'UTC'): Temporal.ZonedDateTime =>
  Temporal.Now.zonedDateTimeISO(zoneId);
