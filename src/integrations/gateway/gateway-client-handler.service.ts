import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeControllerClient } from 'tracking-common';

@Injectable()
export class GatewayClientHandlerService {
  private gatewayClient: NodeControllerClient;

  constructor(private readonly configService: ConfigService) {
    const wsGatewayHostProcessor = configService.getOrThrow<string>(
      'WS_GATEWAY_HOST_PROCESSOR',
    );
    const wsGatewayPortProcessor = configService.getOrThrow<number>(
      'WS_GATEWAY_PORT_PROCESSOR',
    );
    const appPort = configService.getOrThrow<number>('APP_PORT');

    this.gatewayClient = new NodeControllerClient({
      host: wsGatewayHostProcessor,
      port: wsGatewayPortProcessor,
      type: 'tracking-report',
      extra: {
        portHttp: appPort,
      },
    });
  }

  getGatewayClient() {
    return this.gatewayClient;
  }

  setupGatewayClient() {
    this.gatewayClient.wsClientManager.on('enterprises', async () => {});
  }
}
