import { Controller, Get, Post, Query } from '@nestjs/common';
import { PaginationDto } from '../shared/dto/pagination.dto.js';
import { ReportManagementService } from './report-management.service.js';

@Controller('reports/queue')
export class ReportController {
  constructor(
    private readonly reportManagementService: ReportManagementService,
  ) {}

  @Post()
  create() {
    return 'Added to queue';
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.reportManagementService.findAll(paginationDto);
  }
}
