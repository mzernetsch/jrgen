import { RPCClient } from './RPCClient';

export class ExampleAPIClient extends RPCClient {

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
}

export interface SessionLoginRpcResult {
  /**
   * Bearer token of the created session.
   */
  "session_token": string;
  [k: string]: any;
}

export type SessionLogoutRpcResult = number;

export type SessionKeepAliveRpcResult = number;

export interface UserAddRpcParams {
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
}

export type UserAddRpcResult = number;

export interface UserDeleteRpcParams {
  /**
   * Name of the user to add.
   */
  "name": string;
  [k: string]: any;
}

export type UserDeleteRpcResult = number;

export type UserGetAllRpcResult = {
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

export interface Session {
  /**
   * Bearer token of the created session.
   */
  "session_token": string;
  [k: string]: any;
}


