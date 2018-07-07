const fs = require("fs");
const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));

const templateDir = path.join(__dirname, "templates");
const templates = utils.loadTemplates(templateDir);

exports.generate = schemas => {
  return new Promise((resolve, reject) => {
    var schema = utils.mergeSchemas(schemas);

    var pathSpec = "spec";
    var pathSupport = path.join(pathSpec, "support");
    var pathHelpers = path.join(pathSupport, "helpers");

    var artifacts = {};
    artifacts["package.json"] = Buffer.from(buildPackage(schema), "utf-8");
    artifacts["config.json"] = Buffer.from(buildConfig(schema), "utf-8");
    artifacts[
      path.join(pathSpec, schema.info.title + ".spec.js")
    ] = Buffer.from(buildSpec(schema), "utf-8");
    artifacts[path.join(pathSupport, "jasmine.json")] = Buffer.from(
      buildJasmine(schema),
      "utf-8"
    );
    artifacts[path.join(pathHelpers, "SpecHelper.js")] = Buffer.from(
      buildHelper(schema),
      "utf-8"
    );
    resolve(artifacts);
  });
};

var buildHelper = schema => {
  return templates["SpecHelper.js"];
};

var buildJasmine = schema => {
  return templates["jasmine.json"];
};

var buildPackage = schema => {
  return utils.populateTemplate(templates["package.json"], {
    TITLE: schema.info.title
  });
};

var buildSpec = schema => {
  var tests = "";
  Object.keys(schema.methods).forEach(key => {
    tests += utils.populateTemplate(templates["test.js"], {
      METHOD: key,
      RESULT_SCHEMA: JSON.stringify(schema.methods[key].result)
    });
  });

  return utils.populateTemplate(templates["base.js"], {
    TITLE: schema.info.title,
    TESTS: tests
  });
};

var buildConfig = schema => {
  var methods = {};
  Object.keys(schema.methods).forEach(key => {
    methods[key] = {
      params: utils.generateExample(schema.methods[key].params),
      expectError: false
    };
  });

  return utils.populateTemplate(templates["config.json"], {
    METHODS: JSON.stringify(methods, null, 4)
  });
};
