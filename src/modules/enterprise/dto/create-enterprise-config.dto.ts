import { IsOptional, IsString } from 'class-validator';

export class CreateEnterpriseConfigDto {
  @IsString()
  host: string;

  @IsString()
  port: string;

  @IsString()
  database: string;

  @IsString()
  referenceId: string;

  @IsString()
  @IsOptional()
  enterpriseRefId?: string;
}
