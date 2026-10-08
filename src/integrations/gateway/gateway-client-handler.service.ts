import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeControllerClient } from 'tracking-common';
import { EnterprisesWsHandlerService } from './enterprises-ws-handler.service.js';

@Injectable()
export class GatewayClientHandlerService {
  private readonly logger = new Logger('GatewayClientHandlerService');

  private gatewayClient: NodeControllerClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly enterprisesWsHandlerService: EnterprisesWsHandlerService,
  ) {
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
    this.gatewayClient.wsClientManager.on(
      'enterprises',
      async (socket, uuid, enterprisesPayload) => {
        this.logger.log('wsClientGateway.wsClientManager "enterprises"');

        await this.enterprisesWsHandlerService.saveEnterprisesWithConfigurations(
          enterprisesPayload,
        );
      },
    );
  }
}
