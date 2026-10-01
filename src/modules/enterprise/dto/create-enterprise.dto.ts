import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateEnterpriseConfigDto } from './create-enterprise-config.dto.js';

export class CreateEnterpriseDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  enterpriseConfigs: CreateEnterpriseConfigDto[];
}
