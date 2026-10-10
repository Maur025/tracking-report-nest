import { Controller, Get, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { RulesReportQueryParams } from './dto/rules-report-query-params.js';
import { RulesService } from './rules.service.js';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get('reports')
  async generateReportStream(
    @Query() rulesReportQueryParams: RulesReportQueryParams,
  ) {
    const { format, fileName, disposition } = rulesReportQueryParams;

    const response = await this.rulesService.generateReportStream(
      rulesReportQueryParams,
    );

    if (format === 'pdf') {
      return pdfStreamResponse(response, fileName, disposition);
    }

    return excelStreamResponse(response, fileName);
  }
}