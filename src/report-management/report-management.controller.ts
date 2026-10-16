import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportManagementService } from './report-management.service.js';
import { CreateReportManagementDto } from './dto/create-report-management.dto.js';
import { UpdateReportManagementDto } from './dto/update-report-management.dto.js';

@Controller('report-management')
export class ReportManagementController {
  constructor(private readonly reportManagementService: ReportManagementService) {}

  @Post()
  create(@Body() createReportManagementDto: CreateReportManagementDto) {
    return this.reportManagementService.create(createReportManagementDto);
  }

  @Get()
  findAll() {
    return this.reportManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportManagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportManagementDto: UpdateReportManagementDto) {
    return this.reportManagementService.update(+id, updateReportManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportManagementService.remove(+id);
  }
}
