module.exports.Generator = class Generator {
  constructor() {
    this.fs = require("fs");
    this.path = require("path");
    this.json2ts = require("json-schema-to-typescript");
    this.utils = require(this.path.join(__dirname, "../../../", "utils.js"));

    this.templateDir = this.path.join(__dirname, "templates");
    this.templates = this.utils.loadTemplates(this.templateDir);
  }

  generate(schemas) {
    return new Promise((resolve, reject) => {
      var schema = this.utils.mergeSchemas(schemas);

      this.buildClient(schema).then(ts => {
        var artifacts = {};
        artifacts["RPCClient.ts"] = Buffer.from(
          this.templates["client.ts"],
          "utf-8"
        );
        artifacts[schema.info.title + "Client.ts"] = Buffer.from(ts, "utf-8");

        resolve(artifacts);
      });
    });
  }

  buildClient(schema) {
    return new Promise((resolve, reject) => {
      var json2tsOptions = {
        bannerComment: "",
        style: {
          singleQuote: true
        }
      };

      var types = "";
      var methods = "";
      var promises = [];

      Object.keys(schema.methods).forEach(key => {
        methods += this.buildRPCMethod(key, schema.methods[key]) + "\n";

        if (schema.methods[key].params) {
          var promise = this.json2ts.compile(
            schema.methods[key].params,
            key.replace(/\./g, "") + "RpcParams.json",
            json2tsOptions
          );
          promise.then(ts => {
            types += ts + "\n\n";
          });
          promises.push(promise);
        }

        if (schema.methods[key].result) {
          var promise = this.json2ts.compile(
            schema.methods[key].result,
            key.replace(/\./g, "") + "RpcResult.json",
            json2tsOptions
          );
          promise.then(ts => {
            types += ts + "\n\n";
          });
          promises.push(promise);
        }
      });

      Object.keys(schema.definitions).forEach(key => {
        var promise = this.json2ts.compile(
          schema.definitions[key],
          key.replace(/\./g, "") + ".json",
          json2tsOptions
        );
        promise.then(ts => {
          types += ts + "\n\n";
        });
        promises.push(promise);
      });

      Promise.all(promises).then(() => {
        resolve(
          this.utils.populateTemplate(this.templates["base.ts"], {
            TITLE: schema.info.title + "Client",
            METHODS: methods,
            TYPES: types
          })
        );
      });
    });
  }

  buildRPCMethod(method, schema) {
    var paramsType = "?:undefined";
    if (schema.params) {
      paramsType = ":" + method.replace(/\./g, "") + "RpcParams";
    }

    var resultType = "undefined";
    if (schema.result) {
      resultType = method.replace(/\./g, "") + "RpcResult";
    }

    return this.utils.populateTemplate(this.templates["method.ts"], {
      METHOD: method,
      NAME: method.replace(/\./g, "_"),
      PARAMS_TYPE: paramsType,
      RESULT_TYPE: resultType
    });
  }
};
