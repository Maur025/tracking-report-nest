declare module 'tracking-common' {
  class WSClientManager {
    on: (event: string, listener: () => void | Promise<void>) => void;
  }

  export class NodeControllerClient {
    wsClientManager: WSClientManager;

    constructor(options: {
      host: string;
      port: number;
      type: string;
      extra: {
        portUdp?: number;
        portTcp?: number;
        portWs?: number;
        portHttp?: number;
      };
    });
  }
}
