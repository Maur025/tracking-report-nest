import { PartialType } from '@nestjs/mapped-types';
import { CreateEnterpriseDto } from './create-enterprise.dto.js';

export class UpdateEnterpriseDto extends PartialType(CreateEnterpriseDto) {}
