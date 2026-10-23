import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';

export class ReportParamDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @IsIn(['inline', 'attachment'])
  @IsOptional()
  disposition?: 'inline' | 'attachment' = 'inline';

  @IsString()
  @IsOptional()
  fileName: string = 'example';

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  filterByLabel?: string;

  @IsIn(['excel', 'pdf'])
  @IsOptional()
  format: 'excel' | 'pdf' = 'pdf';
}
