export class RPCClient {
  private url: string;
  private requestModifier: RPCModifier[] = [];
  private responseModifier: RPCModifier[] = [];

  constructor(url: string) {
    this.url = url;
  }

  addRequestModifier(modifier: RPCModifier) {
    this.requestModifier.push(modifier);
  }

  addResponseModifier(modifier: RPCModifier) {
    this.responseModifier.push(modifier);
  }

  async request(method: string, params: any) {
    var rpcRequest = {
      jsonrpc: "2.0",
      id: Math.random().toString(16).slice(2),
      method: method,
      params: params,
    };

    this.requestModifier.forEach((modifier) => {
      modifier(rpcRequest);
    });

    const response = await fetch(this.url, {
      method: "post",
      body: JSON.stringify(rpcRequest),
    });

    if (response.ok) {
      const rpcResponse = await response.json();

      this.responseModifier.forEach((modifier) => {
        modifier(rpcResponse);
      });

      if ("error" in rpcResponse) {
        throw new Error(rpcResponse.error);
      } else {
        return rpcResponse.result;
      }
    } else {
      throw new Error(response.statusText);
    }
  }
}

export type RPCModifier = (request: Object) => void;

export interface RPCError {
  code: number;
  message: string;
  data: any;
}
