import { Module } from '@nestjs/common';
import { ReportModule } from '../../report/report.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { ProgressClientService } from './progress-client.service.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  imports: [ReportModule, EnterpriseModule],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressClientService],
})
export class ProgressModule {}
