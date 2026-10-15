import { Temporal } from '@js-temporal/polyfill';

interface GetDateFilterParams {
  date?: Temporal.ZonedDateTime;
  fromDate?: Temporal.ZonedDateTime;
  toDate?: Temporal.ZonedDateTime;
  monthDate?: Temporal.ZonedDateTime;
  yearDate?: Temporal.ZonedDateTime;
  zoneId?: string;
}

export const getDateFilter = ({
  date,
  fromDate,
  toDate,
  monthDate,
  yearDate,
  zoneId = 'UTC',
}: GetDateFilterParams) => {
  if (fromDate && toDate) {
    if (fromDate.epochMilliseconds > toDate.epochMilliseconds) {
      throw new Error('fromDate must be less than or equal to toDate');
    }

    const fromDateInClientZone = Temporal.Instant.from(
      fromDate.toInstant(),
    ).toZonedDateTimeISO(zoneId);

    const toDateInClientZone = Temporal.Instant.from(
      toDate.toInstant(),
    ).toZonedDateTimeISO(zoneId);

    const startDay = fromDateInClientZone.toPlainDate().toZonedDateTime(zoneId);
    const endDay = toDateInClientZone
      .toPlainDate()
      .toZonedDateTime(zoneId)
      .add({ days: 1 })
      .subtract({ nanoseconds: 1 });

    return {
      fromDate: startDay.toInstant().epochMilliseconds,
      toDate: endDay.toInstant().epochMilliseconds,
    };
  }

  if (yearDate) {
    const yearDateInClientZone = Temporal.Instant.from(
      yearDate.toInstant(),
    ).toZonedDateTimeISO(zoneId);

    const startYear = yearDateInClientZone
      .toPlainDate()
      .with({ month: 1, day: 1 })
      .toZonedDateTime(zoneId);

    const endYear = startYear.add({ years: 1 }).subtract({ nanoseconds: 1 });

    return {
      fromDate: startYear.toInstant().epochMilliseconds,
      toDate: endYear.toInstant().epochMilliseconds,
    };
  }

  if (monthDate) {
    const monthDateInClientZone = Temporal.Instant.from(
      monthDate.toInstant(),
    ).toZonedDateTimeISO(zoneId);

    const startMonth = monthDateInClientZone
      .toPlainDate()
      .with({ day: 1 })
      .toZonedDateTime(zoneId);

    const endMonth = startMonth.add({ months: 1 }).subtract({ nanoseconds: 1 });

    return {
      fromDate: startMonth.toInstant().epochMilliseconds,
      toDate: endMonth.toInstant().epochMilliseconds,
    };
  }

  if (!date) {
    return {};
  }

  const dateInClientZone = Temporal.Instant.from(
    date.toInstant(),
  ).toZonedDateTimeISO(zoneId);

  const startDay = dateInClientZone.toPlainDate().toZonedDateTime(zoneId);
  const endDay = startDay.add({ days: 1 }).subtract({ nanoseconds: 1 });

  return {
    fromDate: startDay.toInstant().epochMilliseconds,
    toDate: endDay.toInstant().epochMilliseconds,
  };
};
