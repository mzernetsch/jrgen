type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface Request<MethodType = ExampleAPIMethod, ParamsType = unknown> {
  id?: string;
  method: MethodType;
  params?: ParamsType;
}

export interface Response<
  MethodType = ExampleAPIMethod,
  ResultType = unknown,
  ErrorCodeType = ExampleAPIErrorCode,
> {
  id?: string;
  method: MethodType;
  result?: ResultType;
  error?: RpcError<ErrorCodeType>;
}

export class RpcError<ErrorCodeType = ExampleAPIErrorCode> extends Error {
  constructor(
    public readonly message: string,
    public readonly code: ErrorCodeType,
    public readonly data: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, Error.prototype);
    this.name = "RpcError";
  }
}

export type ExampleAPIMethod =
  | "Session.Login"
  | "Session.Logout"
  | "Session.KeepAlive"
  | "User.Add"
  | "User.Delete"
  | "User.GetAll";

export type ExampleAPIMethodRequestMap = {
  "Session.Login": SessionLoginRequest;
  "Session.Logout": SessionLogoutRequest;
  "Session.KeepAlive": SessionKeepAliveRequest;
  "User.Add": UserAddRequest;
  "User.Delete": UserDeleteRequest;
  "User.GetAll": UserGetAllRequest;
};

export type ExampleAPIMethodResponseMap = {
  "Session.Login": SessionLoginResponse;
  "Session.Logout": SessionLogoutResponse;
  "Session.KeepAlive": SessionKeepAliveResponse;
  "User.Add": UserAddResponse;
  "User.Delete": UserDeleteResponse;
  "User.GetAll": UserGetAllResponse;
};

export const ExampleAPIErrorCode = {
  InvalidCredentials: 1,
  NotFound: 2,
  Alreadyexists: 3,
  Notfound: 2,
} as const;

export type ExampleAPIErrorCode =
  (typeof ExampleAPIErrorCode)[keyof typeof ExampleAPIErrorCode];

export interface SessionLoginParams {
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

export type SessionLoginRequest = WithRequired<
  Request<"Session.Login", SessionLoginParams>,
  "params"
>;

export interface SessionLoginResult {
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

export type SessionLoginResponse = Response<
  "Session.Login",
  SessionLoginResult
>;

export type SessionLoginErrorCode =
  typeof ExampleAPIErrorCode.InvalidCredentials;

export type SessionLoginError = RpcError<SessionLoginErrorCode>;

export type SessionLogoutParams = void;

export type SessionLogoutRequest = Request<
  "Session.Logout",
  SessionLogoutParams
>;
/**
 * Always '0'.
 */
export type SessionLogoutResult = number;

export type SessionLogoutResponse = Response<
  "Session.Logout",
  SessionLogoutResult
>;

export type SessionLogoutErrorCode = typeof ExampleAPIErrorCode.NotFound;

export type SessionLogoutError = RpcError<SessionLogoutErrorCode>;

export type SessionKeepAliveParams = void;

export type SessionKeepAliveRequest = Request<
  "Session.KeepAlive",
  SessionKeepAliveParams
>;
/**
 * Always '0'.
 */
export type SessionKeepAliveResult = number;

export type SessionKeepAliveResponse = Response<
  "Session.KeepAlive",
  SessionKeepAliveResult
>;

export type SessionKeepAliveErrorCode = typeof ExampleAPIErrorCode.NotFound;

export type SessionKeepAliveError = RpcError<SessionKeepAliveErrorCode>;

export interface UserAddParams {
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

export type UserAddRequest = WithRequired<
  Request<"User.Add", UserAddParams>,
  "params"
>;

/**
 * Always '0'.
 */
export type UserAddResult = number;

export type UserAddResponse = Response<"User.Add", UserAddResult>;

export type UserAddErrorCode = typeof ExampleAPIErrorCode.Alreadyexists;

export type UserAddError = RpcError<UserAddErrorCode>;

export type UserDeleteParams =
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

export type UserDeleteRequest = WithRequired<
  Request<"User.Delete", UserDeleteParams>,
  "params"
>;

/**
 * Always '0'.
 */
export type UserDeleteResult = number;

export type UserDeleteResponse = Response<"User.Delete", UserDeleteResult>;

export type UserDeleteErrorCode = typeof ExampleAPIErrorCode.Notfound;

export type UserDeleteError = RpcError<UserDeleteErrorCode>;

export type UserGetAllParams = void;

export type UserGetAllRequest = Request<"User.GetAll", UserGetAllParams>;
/**
 * List of all existing users.
 */
export type UserGetAllResult = {
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

export type UserGetAllResponse = Response<"User.GetAll", UserGetAllResult>;

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

export type ExampleAPIRequest =
  | SessionLoginRequest
  | SessionLogoutRequest
  | SessionKeepAliveRequest
  | UserAddRequest
  | UserDeleteRequest
  | UserGetAllRequest;

export type ExampleAPIResponse =
  | SessionLoginResponse
  | SessionLogoutResponse
  | SessionKeepAliveResponse
  | UserAddResponse
  | UserDeleteResponse
  | UserGetAllResponse;

export class ExampleAPIClient {
  constructor(public url: string) {}

  async send<ResponseType = ExampleAPIResponse>(
    request: ExampleAPIRequest,
  ): Promise<ResponseType> {
    const response = await fetch(this.url, {
      method: "post",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: request.id ?? Math.random().toString(16).slice(2),
        method: request.method,
        params: request.params,
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
}
