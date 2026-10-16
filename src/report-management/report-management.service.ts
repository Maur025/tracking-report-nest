import { Injectable } from '@nestjs/common';
import { CreateReportManagementDto } from './dto/create-report-management.dto.js';
import { UpdateReportManagementDto } from './dto/update-report-management.dto.js';

@Injectable()
export class ReportManagementService {
  create(createReportManagementDto: CreateReportManagementDto) {
    return 'This action adds a new reportManagement';
  }

  findAll() {
    return `This action returns all reportManagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reportManagement`;
  }

  update(id: number, updateReportManagementDto: UpdateReportManagementDto) {
    return `This action updates a #${id} reportManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportManagement`;
  }
}
