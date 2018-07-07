const fs = require("fs");
const path = require("path");
const markdowntable = require("markdown-table");
const utils = require(path.join(__dirname, "../../../", "utils.js"));

const templateDir = path.join(__dirname, "templates");
const templates = utils.loadTemplates(templateDir);

exports.generate = schemas => {
  return new Promise((resolve, reject) => {
    var schema = utils.mergeSchemas(schemas);

    var artifacts = {};
    artifacts[schema.info.title + ".md"] = Buffer.from(
      buildDocumentation(schema),
      "utf-8"
    );

    resolve(artifacts);
  });
};

var normalizeDescription = description => {
  if (Array.isArray(description)) {
    return description.join("  \n");
  }
  return description.toString();
};

var buildDocumentation = schema => {
  return utils.populateTemplate(templates["base.md"], {
    TITLE: schema.info.title,
    DESCRIPTION: normalizeDescription(schema.info.description),
    VERSION: schema.info.version,
    API: buildMethodsDocumentation(schema.methods),
    TOC: buildToc(schema.methods)
  });
};

var buildMethodsDocumentation = methodsSchema => {
  if (!methodsSchema) {
    return "";
  }

  var methodsDocumentation = "";

  for (var methodName in methodsSchema) {
    var methodSchema = methodsSchema[methodName];

    methodsDocumentation +=
      utils.populateTemplate(templates["method.md"], {
        METHOD: methodName,
        SUMMARY: methodSchema.summary,
        EXAMPLE_REQUEST: utils.generateRequestExample(
          methodName,
          methodSchema.params
        ),
        EXAMPLE_RESPONSE: utils.generateResponseExample(methodSchema.result),
        DESCRIPTION: buildDescriptionSection(methodSchema.description),
        PARAMETERS: buildParamsSection(methodSchema.params),
        RESULT: buildResultSection(methodSchema.result),
        ERRORS: buildErrorsSection(methodSchema.errors)
      }) + "\n";
  }

  return methodsDocumentation;
};

var buildDescriptionSection = descripton => {
  if (!descripton) {
    return "";
  }

  return "### Description\n" + normalizeDescription(descripton) + "\n\n";
};

var buildParamsSection = paramsSchema => {
  if (!paramsSchema) {
    return "";
  }

  var paramsPropertyList = [];
  utils.parsePropertyList("params", paramsSchema).forEach(item => {
    paramsPropertyList.push([item.name, item.type, item.description]);
  });

  return (
    "### Parameters\n" +
    markdowntable(
      [["Name", "Type", "Description"]].concat(paramsPropertyList)
    ) +
    "\n\n"
  );
};

var buildResultSection = resultSchema => {
  if (!resultSchema) {
    return "";
  }

  var resultPropertyList = [];
  utils.parsePropertyList("result", resultSchema).forEach(item => {
    resultPropertyList.push([item.name, item.type, item.description]);
  });

  return (
    "### Result\n" +
    markdowntable(
      [["Name", "Type", "Description"]].concat(resultPropertyList)
    ) +
    "\n\n"
  );
};

var buildErrorsSection = errorsSchema => {
  if (!errorsSchema || !errorsSchema.length) {
    return "";
  }

  var errorsPropertyList = [];
  errorsSchema.forEach(item => {
    errorsPropertyList.push([item.code, item.message, item.description]);
  });

  return (
    "### Errors\n" +
    markdowntable(
      [["Code", "Message", "Description"]].concat(errorsPropertyList)
    ) +
    "\n\n"
  );
};

var buildToc = methodsSchema => {
  var toc = "";

  for (var methodName in methodsSchema) {
    toc += "* [" + methodName + "](#" + methodName + ")\n";
  }

  return toc;
};
