import { Temporal } from '@js-temporal/polyfill';
import { Transform } from 'class-transformer';
import { IsInstance, IsOptional, IsString } from 'class-validator';
import { stringToZonedDateTimeISO } from '../../shared/utils/string-to-zoned-date-time-iso.js';
import { ReportParamDto } from './report-param.dto.js';

export class ReportParamWithDateDto extends ReportParamDto {
  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  date?: Temporal.ZonedDateTime;

  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  fromDate?: Temporal.ZonedDateTime;

  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  toDate?: Temporal.ZonedDateTime;

  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  monthDate?: Temporal.ZonedDateTime;

  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  yearDate?: Temporal.ZonedDateTime;

  @IsOptional()
  @IsString()
  zoneId?: string;
}
