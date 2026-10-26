import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';
import { ReportParamWithDateDto } from '../../../report-generator/dto/report-param-with-date.dtoc.js';

export class RulesReportQueryParams extends ReportParamWithDateDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  type: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  frequencyWeekday: string;
}
