import { Module } from '@nestjs/common';
import { ReportModule } from '../../report/report.module.js';
import { EnterpriseModule } from '../enterprise/enterprise.module.js';
import { RulesClientService } from './rules-client.service.js';
import { RulesController } from './rules.controller.js';
import { RulesService } from './rules.service.js';

@Module({
  imports: [ReportModule, EnterpriseModule],
  controllers: [RulesController],
  providers: [RulesService, RulesClientService],
})
export class RulesModule {}