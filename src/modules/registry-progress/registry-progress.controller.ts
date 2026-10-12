import { Controller, Get, Query } from '@nestjs/common';
import { excelStreamResponse } from '../../shared/response/excel-stream-response.js';
import { pdfStreamResponse } from '../../shared/response/pdf-stream-response.js';
import { RegistryProgressReportQueryParams } from './dto/registry-progress-report-query-params.js';
import { RegistryProgressService } from './registry-progress.service.js';

@Controller('registry-progress')
export class RegistryProgressController {
  constructor(
    private readonly registryProgressService: RegistryProgressService,
  ) {}

  @Get('reports')
  async generateReportStream(
    @Query()
    registryProgressReportQueryParams: RegistryProgressReportQueryParams,
  ) {
    const { format, fileName, disposition } = registryProgressReportQueryParams;

    const response = await this.registryProgressService.generateReportStream(
      registryProgressReportQueryParams,
    );

    if (format === 'pdf') {
      return pdfStreamResponse(response, fileName, disposition);
    }

    return excelStreamResponse(response, fileName);
  }
}
