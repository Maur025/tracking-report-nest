import { PartialType } from '@nestjs/mapped-types';
import { CreateReportRequestDto } from './create-report-request.dto.js';

export class UpdateReportRequestDto extends PartialType(
  CreateReportRequestDto,
) {}
