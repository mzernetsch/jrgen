export type ExampleAPIRpcMethod =
  | "Session.Login"
  | "Session.Logout"
  | "Session.KeepAlive"
  | "User.Add"
  | "User.Delete"
  | "User.GetAll";

export class RpcError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: number,
    public readonly data: any,
  ) {
    super(message);
    Object.setPrototypeOf(this, RpcError.prototype);
    this.name = "RpcError";
  }
}

export class ExampleAPIClient {
  async send(
    method: "Session.Login",
    params: SessionLoginRpcParams,
  ): Promise<SessionLoginRpcResult>;
  async send(method: "Session.Logout"): Promise<SessionLogoutRpcResult>;
  async send(method: "Session.KeepAlive"): Promise<SessionKeepAliveRpcResult>;
  async send(
    method: "User.Add",
    params: UserAddRpcParams,
  ): Promise<UserAddRpcResult>;
  async send(
    method: "User.Delete",
    params: UserDeleteRpcParams,
  ): Promise<UserDeleteRpcResult>;
  async send(method: "User.GetAll"): Promise<UserGetAllRpcResult>;

  async send(method: string, params?: unknown): Promise<unknown> {
    const response = await fetch(this.url, {
      method: "post",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Math.random().toString(16).slice(2),
        method,
        params,
      }),
    });

    if (response.ok) {
      const rpcResponse = await response.json();

      if ("error" in rpcResponse) {
        throw new RpcError(
          rpcResponse.error.message,
          rpcResponse.error.code,
          rpcResponse.error.data,
        );
      } else {
        return rpcResponse.result;
      }
    } else {
      throw new Error(response.statusText);
    }
  }

  constructor(public url: string) {}
}

export interface SessionLoginRpcParams {
  /**
   * Name of the user to create a session for.
   */
  name: string;
  /**
   * Password of the user to create a session for.
   */
  password: string;
  [k: string]: unknown;
}

export interface SessionLoginRpcResult {
  /**
   * Bearer token of the created session.
   */
  session_token: string;
  /**
   * Validity of the session token in seconds.
   */
  validity?: number;
  [k: string]: unknown;
}

/**
 * Always '0'.
 */
export type SessionLogoutRpcResult = number;

/**
 * Always '0'.
 */
export type SessionKeepAliveRpcResult = number;

export interface UserAddRpcParams {
  /**
   * Name of the user to add.
   */
  name: string | number;
  /**
   * Email of the user to add.
   */
  email: string;
  /**
   * Address of the user to add.
   */
  address?:
    | []
    | [number]
    | [number, string]
    | [number, string, "Street" | "Avenue" | "Boulevard"]
    | [
        number,
        string,
        "Street" | "Avenue" | "Boulevard",
        "NW" | "NE" | "SW" | "SE",
      ];
  /**
   * Password of the user to add.
   */
  password: string;
  [k: string]: unknown;
}

/**
 * Always '0'.
 */
export type UserAddRpcResult = number;

export type UserDeleteRpcParams =
  | {
      /**
       * Name of the user to delete.
       */
      name: string;
      [k: string]: unknown;
    }
  | {
      /**
       * Id of the user to delete.
       */
      id: string;
      [k: string]: unknown;
    };

/**
 * Always '0'.
 */
export type UserDeleteRpcResult = number;

/**
 * List of all existing users.
 */
export type UserGetAllRpcResult = {
  /**
   * Name of the user.
   */
  name: string;
  /**
   * Email of the user.
   */
  email: string;
  /**
   * Address of the user to add.
   */
  address:
    | []
    | [number]
    | [number, string]
    | [number, string, "Street" | "Avenue" | "Boulevard"]
    | [
        number,
        string,
        "Street" | "Avenue" | "Boulevard",
        "NW" | "NE" | "SW" | "SE",
      ];
  [k: string]: unknown;
}[];

export interface Session {
  /**
   * Bearer token of the created session.
   */
  session_token: string;
  /**
   * Validity of the session token in seconds.
   */
  validity?: number;
  [k: string]: unknown;
}
