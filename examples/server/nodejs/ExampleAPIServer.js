const http = require('http');

class RPCServer {

  constructor() {
    this.api = {};

    this.httpServer = http.createServer((request, response) => {
      this.process(request, response);
    });
  }

  listen(port, ip, callback) {
    this.httpServer.listen(port, ip, callback);
  }

  process(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');

    if (request.method !== 'POST') {
      response.statusCode = 404;
      response.end();
      return;
    }

    this.loadBody(request)
      .then((body) => {

        this.parseRPCMessage(body)
          .then((rpc) => {

            new Promise((resolve, reject) => {
                this.api[rpc.method](rpc.params, resolve, reject);
              })
              .then((result) => {
                response.end(JSON.stringify({
                  id: rpc.id,
                  jsonrpc: "2.0",
                  result: result
                }));
              })
              .catch((error) => {
                response.end(JSON.stringify({
                  id: rpc.id,
                  jsonrpc: "2.0",
                  error: error
                }));
              });
          })
          .catch((error) => {
            response.end(JSON.stringify({
              id: null,
              jsonrpc: "2.0",
              error: error
            }));
          });
      })
      .catch((error) => {
        response.end(JSON.stringify({
          id: null,
          jsonrpc: "2.0",
          error: error
        }));
      });
  }

  loadBody(request) {

    return new Promise((resolve, reject) => {

      var requestBody = "";

      request.on('data', (chunk) => {
        requestBody += chunk;
      });

      request.on('end', () => {
        resolve(requestBody)
      });
    });
  }

  parseRPCMessage(message) {

    return new Promise((resolve, reject) => {

      var rpc;
      try {
        rpc = JSON.parse(message);
      }
      catch (e) {
        return reject({
          'code': -32700,
          'message': 'Parse error'
        });
      }

      if (typeof rpc !== 'object') {
        return reject({
          'code': -32600,
          'message': 'Invalid Request',
          'data': 'rpc is not of type object.'
        });
      }

      if (rpc.jsonrpc !== '2.0') {
        return reject({
          'code': -32600,
          'message': 'Invalid Request',
          'data': 'jsonrpc has not been set or has an invalid value.'
        });
      }

      if (rpc.id && !(typeof rpc.id === 'number' || typeof rpc.id === 'string')) {
        return reject({
          'code': -32600,
          'message': 'Invalid Request',
          'data': 'id is not of type number or string.'
        });
      }

      if (typeof rpc.method !== 'string') {
        return reject({
          'code': -32600,
          'message': 'Invalid Request',
          'data': 'method is not of type string.'
        });
      }

      if (rpc.params && typeof rpc.params !== 'object') {
        return reject({
          'code': -32600,
          'message': 'Invalid Request',
          'data': 'params is not of type object.'
        });
      }

      resolve(rpc);
    });
  }

  expose(method, handler) {
    this.api[method] = handler;
  }
}

module.exports = RPCServer;

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

var server = new RPCServer();

server.expose('Session.Login', (params, resolve, reject) => {
	resolve({
    "session_token": "123456890"
});
});

server.expose('Session.Logout', (params, resolve, reject) => {
	resolve(0);
});

server.expose('Session.KeepAlive', (params, resolve, reject) => {
	resolve(0);
});

server.expose('User.Add', (params, resolve, reject) => {
	resolve(0);
});

server.expose('User.Delete', (params, resolve, reject) => {
	resolve(0);
});

server.expose('User.GetAll', (params, resolve, reject) => {
	resolve([
    {
        "name": "user",
        "email": "user@example.org"
    }
]);
});



server.listen(8080, '127.0.0.1');
