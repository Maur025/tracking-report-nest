import { Controller, Get, Query } from '@nestjs/common';
import { PaginationDto } from '../shared/dto/pagination.dto.js';
import { ReportRequestService } from './services/report-request.service.js';

@Controller('reports/queue')
export class ReportController {
  constructor(private readonly reportRequestService: ReportRequestService) {}

  // @Post()
  // create(@Body() request: any, @Query('resource') resource: string) {
  //   return 'Added to queue';
  // }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.reportRequestService.findAll(paginationDto);
  }
}
