export class RPCClient {

	private url: string;
	private requestModifier: RPCModifier[] = [];
	private responseModifier: RPCModifier[] = [];

	constructor(url:string){
		this.url = url;
	}

	addRequestModifier(modifier:RPCModifier){
		this.requestModifier.push(modifier);
	}

	addResponseModifier(modifier:RPCModifier){
		this.responseModifier.push(modifier);
	}

    private request(method: string, params: any) {

        return new Promise<any>((resolve, reject) => {
			
			var rpcRequest = {
                jsonrpc: "2.0",
                id: Math.random().toString(16).slice(2),
                method: method,
                params: params
            };

			this.requestModifier.forEach((modifier) => {
				modifier(rpcRequest);
			});

            fetch(this.url, {
                method: 'post',
                body: JSON.stringify(rpcRequest),
            }).then((response: any) => {
                if (response.ok) {
                    response.json().then((rpcResponse) => {
						this.responseModifier.forEach((modifier) => {
							modifier(rpcResponse);
						});
                        if ("error" in rpcResponse) {
                            reject(rpcResponse.error);
                        }
                        else {
                            resolve(rpcResponse.result);
                        }
                    });
                }
                else {
                    reject({
                        code: -1,
                        message: "Network error",
                        data: {
                            statusCode: response.status,
                            statusText: response.statusText
                        }
                    });
                }
            })
            .catch((error) => {
                reject({
                    code: -1,
                    message: "Network error"
                });
            });
        });
    };

	//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

{{METHODS}}}

export type RPCModifier = (request:Object) => void;

export interface RPCError {
    code: number;
    message: string;
    data: any;
}

{{TYPES}}
