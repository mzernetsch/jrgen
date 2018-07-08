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
      artifacts[schema.info.title + "Client.js"] = Buffer.from(
        this.buildClient(schema),
        "utf-8"
      );

      resolve(artifacts);
    });
  }

  buildClient(schema) {
    var methods = "";
    Object.keys(schema.methods).forEach(key => {
      methods += this.utils.populateTemplate(this.templates["method.js"], {
        METHOD: key,
        METHOD_NAME: key.replace(/\./g, "_")
      });
    });

    return this.utils.populateTemplate(this.templates["base.js"], {
      CONTENT: methods
    });
  }
};
