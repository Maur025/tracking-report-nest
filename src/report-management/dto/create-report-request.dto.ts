import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { ReportStatusEnum } from '../enums/report-status.enum.js';
import { ReportTypeEnum } from '../enums/report-type-enum.js';

export class CreateReportRequestDto {
  @IsString()
  @IsIn(['event', 'progress', 'registry-progress', 'rules'])
  type: ReportTypeEnum;

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: ReportStatusEnum;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;
}
