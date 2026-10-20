import { PartialType } from '@nestjs/mapped-types';
import { CreateReportManagementDto } from './create-report-management.dto.js';

export class UpdateReportManagementDto extends PartialType(CreateReportManagementDto) {}
