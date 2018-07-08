module.exports.Generator = class Generator {
  constructor() {
    this.fs = require("fs");
    this.path = require("path");
    this.utils = require(this.path.join(__dirname, "../../../", "utils.js"));

    this.templateDir = this.path.join(__dirname, "templates");
    this.templates = this.utils.loadTemplates(this.templateDir);
  }

  generate(schemas) {
    return new Promise((resolve, reject) => {
      var schema = this.utils.mergeSchemas(schemas);

      var artifacts = {};
      artifacts["RPCServer.js"] = Buffer.from(
        this.templates["server.js"],
        "utf-8"
      );
      artifacts[schema.info.title + "Server.js"] = Buffer.from(
        this.buildServer(schema),
        "utf-8"
      );
      resolve(artifacts);
    });
  }

  buildServer(schema) {
    var methods = "";

    Object.keys(schema.methods).forEach(key => {
      var resultSchema = schema.methods[key].result;

      methods += this.utils.populateTemplate(this.templates["method.js"], {
        METHOD: key,
        RESULT: JSON.stringify(
          this.utils.generateExample(resultSchema),
          null,
          4
        )
      });

      methods += "\n";
    });

    return this.utils.populateTemplate(this.templates["base.js"], {
      CONTENT: methods
    });
  }
};
