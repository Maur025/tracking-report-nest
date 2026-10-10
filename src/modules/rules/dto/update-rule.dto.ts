import { PartialType } from '@nestjs/mapped-types';
import { CreateRuleDto } from './create-rule.dto.js';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {}
