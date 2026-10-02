import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { GatewayClientHandlerService } from './gateway-client-handler.service.js';

vi.mock('tracking-common', () => {
  class MockNodeControllerClient {
    wsClientManager = {
      on: vi.fn(),
    };
  }

  return {
    NodeControllerClient: MockNodeControllerClient,
  };
});

import { NodeControllerClient } from 'tracking-common';
import { EnterprisesWsHandlerService } from './enterprises-ws-handler.service.js';

describe('GatewayClientHandlerService', () => {
  let service: GatewayClientHandlerService;
  let mockSaveEnterprisesWithConfigurations: Mock;

  const envConfig = {
    WS_GATEWAY_HOST_PROCESSOR: 'localhost',
    WS_GATEWAY_PORT_PROCESSOR: 7170,
    APP_PORT: 3000,
  };

  beforeEach(async () => {
    mockSaveEnterprisesWithConfigurations = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayClientHandlerService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: keyof typeof envConfig) => envConfig[key],
          },
        },
        {
          provide: EnterprisesWsHandlerService,
          useValue: {
            saveEnterprisesWithConfigurations:
              mockSaveEnterprisesWithConfigurations,
          },
        },
      ],
    }).compile();

    service = module.get<GatewayClientHandlerService>(
      GatewayClientHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return instance of NodeControllerClient', () => {
    // GIVEN

    // WHEN
    const gatewayClient = service.getGatewayClient();

    // THEN
    expect(gatewayClient).toBeDefined();
    expect(gatewayClient).toBeInstanceOf(NodeControllerClient);
  });

  it('should setup gateway client instance', async () => {
    // GIVEN

    // WHEN
    service.setupGatewayClient();

    // THEN
    expect(service.getGatewayClient().wsClientManager.on).toHaveBeenCalledWith(
      expect.stringContaining('enterprises'),
      expect.any(Function),
    );
    expect(mockSaveEnterprisesWithConfigurations).not.toHaveBeenCalled();
  });
});
