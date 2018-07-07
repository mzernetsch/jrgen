jrgen (json-rpc-generator) generates docs, tests, clients, servers and more for json-rpc apis.

Generated example files can be found in the [examples directory](https://github.com/mzernetsch/jrgen/tree/master/examples).

### docs

- [html](https://rawgit.com/mzernetsch/jrgen/master/examples/docs/html/ExampleAPI.html)
- [md](https://rawgit.com/mzernetsch/jrgen/master/examples/docs/md/ExampleAPI.md)
- [gitbook](https://github.com/mzernetsch/jrgen/tree/master/examples/docs/gitbook)

### test

- [jasmine](https://github.com/mzernetsch/jrgen/tree/master/examples/test/jasmine)

### client

- [es6](https://github.com/mzernetsch/jrgen/blob/master/examples/client/es6/ExampleAPIClient.js)
- [ts](https://github.com/mzernetsch/jrgen/blob/master/examples/client/ts/ExampleAPIClient.ts)

### server

- [nodejs](https://github.com/mzernetsch/jrgen/blob/master/examples/server/nodejs/ExampleAPIServer.js)

### spec

- [postman](https://github.com/mzernetsch/jrgen/tree/master/examples/spec/postman/ExampleAPI.postman_collection.json)

## Installation

```bash
npm install -g jrgen
```

## Usage

```bash
  Usage: jrgen [options] [command]


  Options:

    -V, --version        output the version number
    -o, --outdir <path>  Output directory. Defaults to current working directory.
    -h, --help           output usage information


  Commands:

    client/es6 <specFiles...>
    client/ts <specFiles...>
    docs/gitbook <specFiles...>
    docs/html <specFiles...>
    docs/md <specFiles...>
    server/nodejs <specFiles...>
    test/jasmine <specFiles...>
    spec/postman <specFiles...>


  Examples:

    Create html documentation from 'API.schema.json':
    $ jrgen docs/html ~/API.schema.json

    Create a postman collection from 'API.schema.json':
    $ jrgen spec/postman ~/API.schema.json

    Create a js client from 'API.schema.json' and write all generated files into the ./client subdirectory:
    $ jrgen client/es6 -o ./client ~/API.schema.json

    Create a nodejs server from a combination of 'API1.schema.json' and 'API2.schema.json':
    $ jrgen server/nodejs ~/API1.schema.json ~/API2.schema.json
```

## Specification

jrgen uses special [specification files](https://github.com/mzernetsch/jrgen/blob/master/examples/ExampleAPI.schema.json) which describe all available methods, the parameters and the expected result or error responses of an api. A specification file contains valid json and mostly consists of [JSON-Schema](https://spacetelescope.github.io/understanding-json-schema/). A JSON-Schema describing a jrgen specification can be found [here](https://github.com/mzernetsch/jrgen/blob/master/jrgen-spec.schema.json).  
If the api is really large you may consider splitting the specification into multiple files and create references using [JSON-Pointer](https://spacetelescope.github.io/understanding-json-schema/structuring.html#reuse).

```js
{
  $schema: "https://rawgit.com/mzernetsch/jrgen/master/jrgen-spec.schema.json", //Link to the schema. Used for validation and autocompletion in certain editors.
  jrgen: "1.1", //jrgen version.
  jsonrpc: "2.0", //jsonrpc version. Currently always "2.0".

  info: {
    title: "ExampleAPI", //Name of your api.
    description: [
      "An example api which handles various rpc requests.",
      "This api follows the json-rpc 2.0 specification. More information available at http://www.jsonrpc.org/specification."
    ], //Description or usage information about your api.
    version: "1.0" //Current version of your api
  },

  definitions: { //You can define global types and reference them from anywhere using a "$ref" property
    session: {
      type: "object",
      properties: {
        session_token: {
          description: "Bearer token of the created session.",
          default: "123456890",
          type: "string",
          minLength: 1
        }
      },
      required: ["session_token"]
    }
  },

  methods: { //All methods of the api are specified within this object.
    "Session.Login": { //The key of the property equals to the name of the method.
      summary: "Creates a new session.", //Short summary of what the method does.
      description: "Authenticates the user using the provided credentials and creates a new session.", //Longer description of what the method does.
      tags: ["Session"], //Tags for grouping similar methods.

      params: { //json-schema of the params object within a json-rpc request. Can be omitted if not used.
        type: "object",
        properties: {
          name: {
            description: "Name of the user to create a session for.", //You can provide a description for every property.
            default: "admin", //You should provide a valid default value for each non-object and non-array property. These provided default values will be used to generate example requests and responses.
            type: "string",
            minLength: 1
          },
          password: {
            description: "Password of the user to create a session for.",
            default: "123456",
            type: "string",
            minLength: 1
          }
        },
        required: ["name", "password"]
      },

      result: { //json-schema of the result object within a json-rpc response. Can be omitted if not used.
        $ref: "#/definitions/session" //Reference to a global type
      },

      errors: [ //Possible errors in a json-rpc response. Can be omitted if not used.
        {
          description: "The provided credentials are invalid.",

          code: 1, //code is always an integer.
          message: "InvalidCredentials", //message is always a string.
          data: { //json-schema of the data object within a json-rpc error. Can be omitted if not used.
          }
        }
      ]
    }
  }
}
```
