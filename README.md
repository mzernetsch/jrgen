jrgen (json-rpc-generator) generates docs, clients, servers and more for json-rpc apis.

Generated example files can be found in the [examples directory](https://github.com/mzernetsch/jrgen/tree/master/examples).

### docs

- [html](https://rawgit.com/mzernetsch/jrgen/master/examples/docs/html/example-api-reference.html)
- [md](https://rawgit.com/mzernetsch/jrgen/master/examples/docs/md/example-api-reference.md)

### client

- [web-js](https://github.com/mzernetsch/jrgen/blob/master/examples/client/web/js/example-api-client.js)
- [web-ts](https://github.com/mzernetsch/jrgen/blob/master/examples/client/web/ts/example-api-client.ts)

### server

- [nodejs-js](https://github.com/mzernetsch/jrgen/blob/master/examples/server/nodejs/js/example-api-server.js)

### spec

- [postman](https://github.com/mzernetsch/jrgen/tree/master/examples/spec/postman/example-api.postman_collection.json)

## Installation

```bash
npm install -g jrgen
```

## Usage

```bash
Usage: jrgen [options] [command]

Options:
  -V, --version                    output the version number
  -o, --outdir <path>              Output directory. Defaults to current working directory.
  -h, --help                       display help for command

Commands:
  client-web-js <specFilePath>
  client-web-ts <specFilePath>
  docs-html <specFilePath>
  docs-md <specFilePath>
  server-nodejs-js <specFilePath>
  spec-postman <specFilePath>
  help [command]                   display help for command


  Examples:

    Create html documentation from 'API.jrgen.json':
    $ jrgen docs-html ~/API.jrgen.json

    Create a postman specification from 'API.jrgen.json':
    $ jrgen spec-postman ~/API.jrgen.json

    Create a ts web client from 'API.jrgen.json' and write all generated files into the ./client subdirectory:
    $ jrgen client-web-ts -o ./client ~/API.jrgen.json
```

## Specification

jrgen uses special [specification files](https://github.com/mzernetsch/jrgen/blob/master/examples/ExampleAPI.jrgen.json) which describe all available methods, the parameters and the expected result or error responses of an api. A specification file contains valid json and mostly consists of [JSON-Schema](https://spacetelescope.github.io/understanding-json-schema/). A JSON-Schema describing a jrgen specification can be found [here](https://github.com/mzernetsch/jrgen/blob/master/jrgen-spec.schema.json).
If the api is really large you may consider splitting the specification into multiple files and create references using [JSON-Pointer](https://spacetelescope.github.io/understanding-json-schema/structuring.html#reuse).

```js
{
  $schema: "https://rawgit.com/mzernetsch/jrgen/master/jrgen-spec.schema.json", //Link to the schema. Used for validation and autocompletion in certain editors.
  jrgen: "1.1", //jrgen spec version.
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
      type: "request", //Default type is "request", if it set to "notify", the generated example will not contain the request id and the entire response body.

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

## Plugins

jrgen provides a simple plugin mechanism which allows to add new blueprints to generate additional artifacts.

A jrgen plugin...

- is a nodejs module.
- has a name that starts with `jrgen-plugin-` (e.g. `jrgen-plugin-myplugin`).
- contains `*.jrgen.blueprint.js` files which will be used to generate new artifacts.
- must be installed as a sibling to jrgen (e.g. `npm i -g jrgen jrgen-plugin-myplugin`).

### Blueprints

The artifacts are generated based on a specification called `Blueprint` which itself is created by a `BlueprintFactory`.

A `Blueprint` contains the actual artifacts data in form of templates and an optional model which will be used to render dynamic templates using the [mustache.js](https://github.com/janl/mustache.js) library. Basically for every template key ending with `.mustache`, jrgen will call `mustache.render(template, model)` and remove the `.mustache` extension. Templates without `.mustache` extension are static and won't be changed.

```json
{
  "templates": {
    "HelloWorld.txt": "Hello world!",
    "sub/HelloWorld.txt": "Hello world!",
    "sub/sub/HelloWorld.txt.mustache": "Hello {{title}}!"
  },
  "model": {
    "title": "world"
  }
}
```

A `BlueprintFactory` is a file ending with `.jrgen.blueprint.js`. It exports a function which creates the `Blueprint` based on the provided jrgen specification. The name of the file will be used as the cli command to generate the artifacts (e.g. a factory with the name `docs-txt.jrgen.blueprint.js` can be called using `jrgen docs-txt 'API.jrgen.json'`).

```js
module.exports = async (spec) => {
  return {
    templates: {
      "HelloWorld.txt.mustache": "Hello {{title}}!",
    },
    model: {
      title: spec.info.title,
    },
  };
};
```
