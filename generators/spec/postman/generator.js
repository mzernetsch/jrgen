module.exports.Generator = class Generator {
  constructor() {
    this.fs = require("fs");
    this.path = require("path");
    this.uuidv5 = require("uuid/v5");
    this.utils = require(this.path.join(__dirname, "../../../", "utils.js"));

    this.templateDir = this.path.join(__dirname, "templates");
    this.templates = this.utils.loadTemplates(this.templateDir);
  }

  generate(schemas) {
    return new Promise((resolve, reject) => {
      var schema = this.utils.mergeSchemas(schemas);

      var artifacts = {};
      artifacts[schema.info.title + ".postman_collection.json"] = Buffer.from(
        this.buildCollection(schema),
        "utf-8"
      );
      resolve(artifacts);
    });
  }

  normalizeDescription(description) {
    if (Array.isArray(description)) {
      return description.join("\n");
    }
    return description.toString();
  }

  buildCollection(schema) {
    var collection = {
      info: {
        _postman_id: this.uuidv5.URL,
        name: schema.info.title,
        description: this.normalizeDescription(schema.info.description),
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: []
    };

    Object.keys(schema.methods).forEach(key => {
      collection.item.push(this.buildItem(key, schema.methods[key]));
    });

    return JSON.stringify(collection, null, 4);
  }

  buildItem(method, methodSchema) {
    var responseSchema = {
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        jsonrpc: {
          type: "string",
          enum: ["2.0"]
        },
        result: methodSchema.result
      },
      required: ["id", "jsonrpc", "result"]
    };

    return {
      name: method,
      event: [
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              `var schema = ${JSON.stringify(responseSchema)};`,
              "",
              "pm.test('Schema is valid', function() {",
              "  var jsonData = pm.response.json();",
              "  tv4.validate(jsonData, schema);",
              "  pm.expect(JSON.stringify(tv4.error)).to.eql('null');",
              "});",
              ""
            ]
          }
        }
      ],
      request: {
        method: "POST",
        header: [
          {
            key: "Content-Type",
            value: "application/json"
          }
        ],
        body: {
          mode: "raw",
          raw: this.utils.generateRequestExample(method, methodSchema.params)
        },
        url: { raw: "{{url}}", host: ["{{url}}"] },
        description: methodSchema.description || methodSchema.summary
      },
      response: []
    };
  }
};
