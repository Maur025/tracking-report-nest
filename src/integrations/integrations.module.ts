import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module.js';
import { EnterprisesWsHandlerService } from './gateway/enterprises-ws-handler.service.js';
import { GatewayClientHandlerService } from './gateway/gateway-client-handler.service.js';
import { SchedulerCommonService } from './scheduler/scheduler-common.service.js';

@Module({
  imports: [SharedModule],
  providers: [
    SchedulerCommonService,
    GatewayClientHandlerService,
    EnterprisesWsHandlerService,
  ],
})
export class IntegrationsModule {}
