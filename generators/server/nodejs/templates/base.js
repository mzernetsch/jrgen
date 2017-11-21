const RPCServer = require('./RPCServer.js');

var server = new RPCServer();

{{CONTENT}}

server.listen(8080, '127.0.0.1');
