import { Controller, Get } from '@nestjs/common';
import { RegistryProgressService } from './registry-progress.service.js';

@Controller('registry-progress')
export class RegistryProgressController {
  constructor(
    private readonly registryProgressService: RegistryProgressService,
  ) {}

  @Get('reports')
  async generateReportStream() {
    return this.registryProgressService.generateReportStream();
  }
}
