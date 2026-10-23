import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { RegistryProgressClientService } from './registry-progress-client.service.js';
import { RegistryProgressController } from './registry-progress.controller.js';
import { RegistryProgressService } from './registry-progress.service.js';

@Module({
  imports: [ReportGeneratorModule, EnterpriseModule],
  controllers: [RegistryProgressController],
  providers: [RegistryProgressService, RegistryProgressClientService],
})
export class RegistryProgressModule {}
