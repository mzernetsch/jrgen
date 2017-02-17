jrgen (json-rpc-generator) generates docs, tests, clients and servers for json-rpc apis.

Usage
-----
jrgen is divided in 4 sections 'docs', 'test', 'client' and 'server'. Call `jrgen -h` or `jrgen [section] -h` for usage information.

### Examples
Create html documentation from 'API.schema.json'.
```bash
$ jrgen docs ~/API.schema.json
```

Create jasmine unit tests from 'API.schema.json'.
```bash
$ jrgen test -f jasmine ~/API.schema.json
```

Create a js client from 'API.schema.json' and write all generated files into the ./client subdirectory.
```bash
$ jrgen client -o ./client ~/API.schema.json
```

Create a nodejs server from a combination of 'API1.schema.json' and 'API2.schema.json'. The generated server will handle the api calls of both schemes. A schema will overwrite all properties of its preceeding schemes.
```bash
$ jrgen server ~/API1.schema.json ~/API2.schema.json
```

Available generators
--------------------
Generators for following formats are currently available:

### docs
- html

### test
- jasmine

### client
- js

### server
- nodejs

Schema
------
A schema is a specification of a json-rpc api. It describes all available methods, its parameters and the expected result or error responses. An example for a schema can be found in the examples directory. All generators do their work based on this specification.

```js
{
	"jrgen":"1.0",		//jrgen version. Currently always "1.0".
	"jsonrpc":"2.0",	//jsonrpc version. Currently always "2.0".

	"info":{
		"title":"ExampleAPI",	//Name of your api.
		"description":"This api handles various rpc requests.",	//Description or usage information about your api.
		"version":"1.0"	//Current version of your api
	},

	"methods":{	//All methods of the api are specified within this object.
		"Session.Login":{	//The key of the property equals to the name of the method.
			"summary":"Creates a new session.",	//Short summary of what the method does.
			"description":"Authenticates the user using the provided credentials and creates a new session.",	//Longer description of what the method does.

			"tags":["Session"],	//Tags for grouping similar methods.

			"params":{	//json-schema of the params object within a json-rpc request. Can be omitted if not used.
				"type":"object",
				"properties":{
					"name":{
						"description":"Name of the user to create a session for.",	//You can provide a description for every property.
						"example":"admin",	//You should provide a valid example value for each non-object and non-array property. These provided example values will be used to generate example requests and responses.

						"type":"string",
						"minLength":1
					},
					"password":{
						"description":"Password of the user to create a session for.",
						"example":"123456",

						"type":"string",
						"minLength":1
					}
				},

				"required":["name", "password"]
			},

			"result":{	//json-schema of the result object within a json-rpc response. Can be omitted if not used.
				"type":"object",
				"properties":{
					"session_token":{
						"description":"Bearer token of the created session.",
						"example":"123456890",

						"type":"string",
						"minLength":1
					}
				},

				"required":["session_token"]
			},

			"errors":[	//Possible errors in a json-rpc response. Can be omitted if not used.
				{
					"description":"The provided credentials are invalid.",

					"code":1,	//code is always an integer.
					"message":"InvalidCredentials"	//message is always a string.
					"data":{	//data is a json-schema describing its contents. Can be omitted is not used.

					}
				}
			]
		}
	}
}
```

Create new generators
---------------------
1. Create a new subfolder within the generators dir. The name of the subfolder equals to the name of the format.
```
jrgen/generators/<type>/<format>/
```
2. Create a file 'generator.js' within that newly created directory. Fill it with the following code. Parameter [schema] is the schema of the api and [outdir] is a path to a directory where you should place your generated content.
```js
exports.generate = (schema, outdir) => {
	//TODO implement me
}
```
3. Implement your generator.
