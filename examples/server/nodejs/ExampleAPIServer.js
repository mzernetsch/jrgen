const RPCServer = require("./RPCServer.js");

var server = new RPCServer();

server.expose("Session.Login", (params, resolve, reject) => {
  resolve({
    session_token: "123456890",
    validity: 3600,
  });
});

server.expose("Session.Logout", (params, resolve, reject) => {
  resolve(0);
});

server.expose("Session.KeepAlive", (params, resolve, reject) => {
  resolve(0);
});

server.expose("User.Add", (params, resolve, reject) => {
  resolve(0);
});

server.expose("User.Delete", (params, resolve, reject) => {
  resolve(0);
});

server.expose("User.GetAll", (params, resolve, reject) => {
  resolve([
    {
      name: "user",
      email: "user@example.org",
      address: [1600, "Pennsylvania", "Avenue", "NW"],
    },
  ]);
});

server.listen(8080, "127.0.0.1");
