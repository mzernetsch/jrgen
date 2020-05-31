class RPCClient {
  constructor(url) {
    this.url = url;
  }

  request(method, params) {
    return new Promise((resolve, reject) => {
      fetch(this.url, {
        method: "post",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Math.random().toString(16).slice(2),
          method: method,
          params: params,
        }),
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((rpcResponse) => {
              if ("error" in rpcResponse) {
                reject(rpcResponse.error);
              } else {
                resolve(rpcResponse.result);
              }
            });
          } else {
            reject({
              code: -1,
              message: "Network error",
              data: {
                statusCode: response.status,
                statusText: response.statusText,
              },
            });
          }
        })
        .catch((error) => {
          reject({
            code: -1,
            message: "Network error",
          });
        });
    });
  }

  Session_Login(params) {
    return this.request("Session.Login", params);
  }
  Session_Logout(params) {
    return this.request("Session.Logout", params);
  }
  Session_KeepAlive(params) {
    return this.request("Session.KeepAlive", params);
  }
  User_Add(params) {
    return this.request("User.Add", params);
  }
  User_Delete(params) {
    return this.request("User.Delete", params);
  }
  User_GetAll(params) {
    return this.request("User.GetAll", params);
  }
}

module.exports = RPCClient;
