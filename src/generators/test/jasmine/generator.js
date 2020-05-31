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

      var pathSpec = "spec";
      var pathSupport = this.path.join(pathSpec, "support");
      var pathHelpers = this.path.join(pathSupport, "helpers");

      var artifacts = {};
      artifacts["package.json"] = Buffer.from(
        this.buildPackage(schema),
        "utf-8"
      );
      artifacts["config.json"] = Buffer.from(this.buildConfig(schema), "utf-8");
      artifacts[
        this.path.join(pathSpec, schema.info.title + ".spec.js")
      ] = Buffer.from(this.buildSpec(schema), "utf-8");
      artifacts[this.path.join(pathSupport, "jasmine.json")] = Buffer.from(
        this.buildJasmine(schema),
        "utf-8"
      );
      artifacts[this.path.join(pathHelpers, "SpecHelper.js")] = Buffer.from(
        this.buildHelper(schema),
        "utf-8"
      );
      resolve(artifacts);
    });
  }

  buildHelper(schema) {
    return this.templates["SpecHelper.js"];
  }

  buildJasmine(schema) {
    return this.templates["jasmine.json"];
  }

  buildPackage(schema) {
    return this.utils.populateTemplate(this.templates["package.json"], {
      TITLE: schema.info.title
    });
  }

  buildSpec(schema) {
    var tests = "";
    Object.keys(schema.methods).forEach(key => {
      tests += this.utils.populateTemplate(this.templates["test.js"], {
        METHOD: key,
        RESULT_SCHEMA: JSON.stringify(schema.methods[key].result)
      });
    });

    return this.utils.populateTemplate(this.templates["base.js"], {
      TITLE: schema.info.title,
      TESTS: tests
    });
  }

  buildConfig(schema) {
    var methods = {};
    Object.keys(schema.methods).forEach(key => {
      methods[key] = {
        params: this.utils.generateExample(schema.methods[key].params),
        expectError: false
      };
    });

    return this.utils.populateTemplate(this.templates["config.json"], {
      METHODS: JSON.stringify(methods, null, 4)
    });
  }
};
