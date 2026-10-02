import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { GatewayClientHandlerService } from './gateway-client-handler.service.js';

@Injectable()
export class GatewayConnectionConfig implements OnApplicationBootstrap {
  constructor(
    private readonly gatewayClientHandlerService: GatewayClientHandlerService,
  ) {}

  async onApplicationBootstrap() {
    await this.gatewayClientHandlerService.getGatewayClient().start();
    this.gatewayClientHandlerService.setupGatewayClient();
  }
}
