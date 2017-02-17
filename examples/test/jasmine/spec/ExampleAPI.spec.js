const http = require('http');
const config = require('../config.json');

describe("ExampleAPI", () => {

    var rpcResultResponseSchema = {
        "type": "object",

        "properties": {
            "jsonrpc": {
                "type": "string",
                "enum": ["2.0"]
            },
            "id": {
                "type": "string",
                "minLength": 1
            }
        },

        "required": ["jsonrpc", "id", "result"]
    }

    var rpcErrorResponseSchema = {
        "type": "object",

        "properties": {
            "jsonrpc": {
                "type": "string",
                "enum": ["2.0"]
            },
            "id": {
                "type": "string",
                "minLength": 1
            },
            "error": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "number"
                    },
                    "message": {
                        "type": "string"
                    }
                },

                "required": ["code", "message"]
            }
        },

        "required": ["jsonrpc", "id", "error"]
    }

    var request = (method, params) => {

        var request = {
            jsonrpc: "2.0",
            id: Math.random().toString(16).slice(2),
            method: method,
            params: params
        }

        if (config.log.verbose) {
            console.log(JSON.stringify(request, null, 4));
        }

        return new Promise((resolve, reject) => {

			var httpRequest = http.request({
			    host: config.api.host,
				port: config.api.port,
			    path: config.api.path,
			    method: 'POST'
			}, (response) => {

				if(response.statusCode < 200 || response.statusCode > 299){
					reject({
						code: -1,
						message: "Network error",
						data: {
							statusCode: response.status,
							statusText: response.statusText
						}
					});
					return;
				}

			    var message = ''
			    response.on('data', function(chunk) {
			        message += chunk;
			    });

			    response.on('end', function() {
					if (config.log.verbose) {
                        console.log(JSON.stringify(response, null, 4));
                    }

					var rpcResponse = {};
					try{
						rpcResponse = JSON.parse(message);
					}
					catch(error){
						reject({
							code: -32700,
							message: "Parse error"
						});
						return;
					}

					if ("error" in rpcResponse) {
						expect(rpcResponse).toConform(rpcErrorResponseSchema);
						reject(rpcResponse.error);
					} else {
						expect(rpcResponse).toConform(rpcResultResponseSchema);
						resolve(rpcResponse.result);
					}
			    });
			});

			httpRequest.on('error', (error) => {
				reject({
					code: -1,
					message: 'Network error',
					data: error.message
				});
			});

			httpRequest.write(JSON.stringify(request));
			httpRequest.end();
        });
    };

    it("should handle 'Session.Login' requests.", (done) => {

	var methodConfig = config.methods['Session.Login'];

	request('Session.Login', methodConfig.params)
		.then((result) => {

			if(methodConfig.expectError){
				fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
				done();
				return;
			}

			expect(result).toConform({"type":"object","properties":{"session_token":{"description":"Bearer token of the created session.","example":"123456890","type":"string","minLength":1}},"required":["session_token"]});
			done();
		})
		.catch((error) => {

			if(!methodConfig.expectError){
				fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
				done();
				return;
			}

			done();
		});
});
it("should handle 'Session.Logout' requests.", (done) => {

	var methodConfig = config.methods['Session.Logout'];

	request('Session.Logout', methodConfig.params)
		.then((result) => {

			if(methodConfig.expectError){
				fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
				done();
				return;
			}

			expect(result).toConform({"description":"Always 0.","example":0,"type":"number","minimum":0,"maximum":0});
			done();
		})
		.catch((error) => {

			if(!methodConfig.expectError){
				fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
				done();
				return;
			}

			done();
		});
});
it("should handle 'Session.KeepAlive' requests.", (done) => {

	var methodConfig = config.methods['Session.KeepAlive'];

	request('Session.KeepAlive', methodConfig.params)
		.then((result) => {

			if(methodConfig.expectError){
				fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
				done();
				return;
			}

			expect(result).toConform({"description":"Always 0.","example":0,"type":"number","minimum":0,"maximum":0});
			done();
		})
		.catch((error) => {

			if(!methodConfig.expectError){
				fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
				done();
				return;
			}

			done();
		});
});
it("should handle 'User.Add' requests.", (done) => {

	var methodConfig = config.methods['User.Add'];

	request('User.Add', methodConfig.params)
		.then((result) => {

			if(methodConfig.expectError){
				fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
				done();
				return;
			}

			expect(result).toConform({"description":"Always 0.","example":0,"type":"number","minimum":0,"maximum":0});
			done();
		})
		.catch((error) => {

			if(!methodConfig.expectError){
				fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
				done();
				return;
			}

			done();
		});
});
it("should handle 'User.Delete' requests.", (done) => {

	var methodConfig = config.methods['User.Delete'];

	request('User.Delete', methodConfig.params)
		.then((result) => {

			if(methodConfig.expectError){
				fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
				done();
				return;
			}

			expect(result).toConform({"description":"Always 0.","example":0,"type":"number","minimum":0,"maximum":0});
			done();
		})
		.catch((error) => {

			if(!methodConfig.expectError){
				fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
				done();
				return;
			}

			done();
		});
});
it("should handle 'User.GetAll' requests.", (done) => {

	var methodConfig = config.methods['User.GetAll'];

	request('User.GetAll', methodConfig.params)
		.then((result) => {

			if(methodConfig.expectError){
				fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
				done();
				return;
			}

			expect(result).toConform({"description":"List of all existing users.","type":"array","items":{"description":"Information about a user.","type":"object","properties":{"name":{"description":"Name of the user.","example":"user","type":"string","minLength":1},"email":{"description":"Email of the user.","example":"user@example.org","type":"string","format":"email"}}}});
			done();
		})
		.catch((error) => {

			if(!methodConfig.expectError){
				fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
				done();
				return;
			}

			done();
		});
});

});
