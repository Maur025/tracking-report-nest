import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module.js';
import { EnterpriseController } from './enterprise.controller.js';
import { EnterpriseService } from './enterprise.service.js';
import { EnterpriseConfig } from './entities/enterprise-config.entity.js';
import { Enterprise } from './entities/enterprise.entity.js';

@Module({
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
  imports: [
    TypeOrmModule.forFeature([Enterprise, EnterpriseConfig]),

    SharedModule,
  ],
})
export class EnterpriseModule {}
