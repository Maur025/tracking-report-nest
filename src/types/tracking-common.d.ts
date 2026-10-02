declare module 'tracking-common' {
  class WSClientManager {
    on: (
      event: string,
      listener: (...args: any[]) => void | Promise<void>,
    ) => void;
  }

  export class NodeControllerClient {
    wsClientManager: WSClientManager;
    start: () => Promise<void>;

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
