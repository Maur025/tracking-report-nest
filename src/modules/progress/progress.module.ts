import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { ProgressClientService } from './progress-client.service.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  imports: [ReportGeneratorModule, EnterpriseModule],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressClientService],
})
export class ProgressModule {}
