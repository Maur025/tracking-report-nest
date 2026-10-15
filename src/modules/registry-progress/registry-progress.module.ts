import { Module } from '@nestjs/common';
import { ReportModule } from '../../report/report.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { RegistryProgressClientService } from './registry-progress-client.service.js';
import { RegistryProgressController } from './registry-progress.controller.js';
import { RegistryProgressService } from './registry-progress.service.js';

@Module({
  imports: [ReportModule, EnterpriseModule],
  controllers: [RegistryProgressController],
  providers: [RegistryProgressService, RegistryProgressClientService],
})
export class RegistryProgressModule {}
