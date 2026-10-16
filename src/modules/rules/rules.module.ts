import { Module } from '@nestjs/common';
import { ReportGeneratorModule } from '../../report-generator/report-generator.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { RulesClientService } from './rules-client.service.js';
import { RulesController } from './rules.controller.js';
import { RulesService } from './rules.service.js';

@Module({
  imports: [ReportGeneratorModule, EnterpriseModule],
  controllers: [RulesController],
  providers: [RulesService, RulesClientService],
})
export class RulesModule {}
