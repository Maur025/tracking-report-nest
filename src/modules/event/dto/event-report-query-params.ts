import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';
import { ReportParamWithDateDto } from '../../../report/dto/report-param-with-date.dto.js';

export class EventReportQueryParams extends ReportParamWithDateDto {
  @IsString()
  @IsOptional()
  vehicleId: string;

  @IsString()
  @IsOptional()
  ruleId: string;

  @IsString()
  @IsOptional()
  inout: string;

  @IsString()
  @IsOptional()
  geofenceId: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  type: string;

  @IsString()
  @IsOptional()
  deventId: string;
}
