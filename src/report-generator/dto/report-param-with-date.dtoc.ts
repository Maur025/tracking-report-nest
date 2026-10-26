import { Temporal } from '@js-temporal/polyfill';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInstance, IsOptional, IsString } from 'class-validator';
import { stringToZonedDateTimeISO } from '../../shared/utils/string-to-zoned-date-time-iso.js';
import { ReportParamDto } from './report-param.dto.js';

export class ReportParamWithDateDto extends ReportParamDto {
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  date?: Temporal.ZonedDateTime;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  fromDate?: Temporal.ZonedDateTime;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  toDate?: Temporal.ZonedDateTime;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  monthDate?: Temporal.ZonedDateTime;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Transform(stringToZonedDateTimeISO)
  @IsInstance(Temporal.ZonedDateTime)
  yearDate?: Temporal.ZonedDateTime;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  zoneId?: string;
}
