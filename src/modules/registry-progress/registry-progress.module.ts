import { Module } from '@nestjs/common';
import { RegistryProgressService } from './registry-progress.service.js';
import { RegistryProgressController } from './registry-progress.controller.js';

@Module({
  controllers: [RegistryProgressController],
  providers: [RegistryProgressService],
})
export class RegistryProgressModule {}
