import { Module } from '@nestjs/common';
import { RulesService } from './rules.service.js';
import { RulesController } from './rules.controller.js';

@Module({
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
