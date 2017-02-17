const http = require('http');
const config = require('../config.json');

describe("{{TITLE}}", () => {

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

    {{TESTS}}
});
