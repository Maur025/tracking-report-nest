import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';

export class ReportParamDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @IsIn(['inline', 'attachment'])
  @IsOptional()
  disposition?: string = 'inline';

  @IsString()
  @IsOptional()
  fileName: string = 'example';

  @IsString()
  @IsOptional()
  filterByLabel?: string;

  @IsIn(['json', 'excel', 'pdf'])
  @IsOptional()
  format: string = 'json';
}
