import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
  @IsString()
  @IsOptional()
  sortBy: string = 'id';

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  descending: boolean = false;

  @IsInt()
  @Min(0)
  @IsOptional()
  page: number = 0;

  @IsInt()
  @Min(1)
  @IsOptional()
  size: number = 10;
}
