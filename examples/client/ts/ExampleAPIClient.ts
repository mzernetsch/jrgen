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

	Session_Login (params:SessionLoginRpcParams) {
		return new Promise<SessionLoginRpcResult>((resolve, reject) => {
			this.request('Session.Login', params).then(resolve).catch(reject);
		});
	}

	Session_Logout (params?:undefined) {
		return new Promise<SessionLogoutRpcResult>((resolve, reject) => {
			this.request('Session.Logout', params).then(resolve).catch(reject);
		});
	}

	Session_KeepAlive (params?:undefined) {
		return new Promise<SessionKeepAliveRpcResult>((resolve, reject) => {
			this.request('Session.KeepAlive', params).then(resolve).catch(reject);
		});
	}

	User_Add (params:UserAddRpcParams) {
		return new Promise<UserAddRpcResult>((resolve, reject) => {
			this.request('User.Add', params).then(resolve).catch(reject);
		});
	}

	User_Delete (params:UserDeleteRpcParams) {
		return new Promise<UserDeleteRpcResult>((resolve, reject) => {
			this.request('User.Delete', params).then(resolve).catch(reject);
		});
	}

	User_GetAll (params?:undefined) {
		return new Promise<UserGetAllRpcResult>((resolve, reject) => {
			this.request('User.GetAll', params).then(resolve).catch(reject);
		});
	}

}

export type RPCModifier = (request:Object) => void;

export interface RPCError {
    code: number;
    message: string;
    data: any;
}

export interface SessionLoginRpcParams {
  /**
   * Name of the user to create a session for.
   */
  "name": string;
  /**
   * Password of the user to create a session for.
   */
  "password": string;
  [k: string]: any;
}export interface SessionLoginRpcResult {
  /**
   * Bearer token of the created session.
   */
  "session_token": string;
  [k: string]: any;
}export type SessionLogoutRpcResult = number;export type SessionKeepAliveRpcResult = number;export interface UserAddRpcParams {
  /**
   * Name of the user to add.
   */
  "name": string;
  /**
   * Email of the user to add.
   */
  "email": string;
  /**
   * Password of the user to add.
   */
  "password": string;
  [k: string]: any;
}export type UserAddRpcResult = number;export interface UserDeleteRpcParams {
  /**
   * Name of the user to add.
   */
  "name": string;
  [k: string]: any;
}export type UserDeleteRpcResult = number;export type UserGetAllRpcResult = {
  /**
   * Name of the user.
   */
  "name"?: string;
  /**
   * Email of the user.
   */
  "email"?: string;
  [k: string]: any;
}[];
