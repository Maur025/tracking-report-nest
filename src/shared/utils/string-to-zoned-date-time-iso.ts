import { Temporal } from '@js-temporal/polyfill';

export const stringToZonedDateTimeISO = (
  { value }: Record<string, any>,
  zoneId: string = 'UTC',
): Temporal.ZonedDateTime | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  return Temporal.Instant.from(value).toZonedDateTimeISO(zoneId);
};
