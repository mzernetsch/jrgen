module.exports.Generator = class Generator {
  constructor() {
    this.fs = require("fs");
    this.path = require("path");
    this.markdowntable = require("markdown-table");
    this.utils = require(this.path.join(__dirname, "../../../", "utils.js"));

    this.templateDir = this.path.join(__dirname, "templates");
    this.templates = this.utils.loadTemplates(this.templateDir);
  }

  generate(schemas) {
    return new Promise((resolve, reject) => {
      var schema = this.utils.mergeSchemas(schemas);

      var artifacts = {};
      artifacts[schema.info.title + ".md"] = Buffer.from(
        this.buildDocumentation(schema),
        "utf-8"
      );

      resolve(artifacts);
    });
  }

  normalizeDescription(description) {
    if (Array.isArray(description)) {
      return description.join("  \n");
    }
    return description.toString();
  }

  buildDocumentation(schema) {
    return this.utils.populateTemplate(this.templates["base.md"], {
      TITLE: schema.info.title,
      DESCRIPTION: this.normalizeDescription(schema.info.description),
      VERSION: schema.info.version,
      API: this.buildMethodsDocumentation(schema.methods),
      TOC: this.buildToc(schema.methods)
    });
  }

  buildMethodsDocumentation(methodsSchema) {
    if (!methodsSchema) {
      return "";
    }

    var methodsDocumentation = "";

    for (var methodName in methodsSchema) {
      var methodSchema = methodsSchema[methodName];

      methodsDocumentation +=
        this.utils.populateTemplate(this.templates["method.md"], {
          METHOD: methodName,
          SUMMARY: methodSchema.summary,
          EXAMPLE_REQUEST: this.utils.generateRequestExample(
            methodName,
            methodSchema.params
          ),
          EXAMPLE_RESPONSE: this.utils.generateResponseExample(
            methodSchema.result
          ),
          DESCRIPTION: this.buildDescriptionSection(methodSchema.description),
          PARAMETERS: this.buildParamsSection(methodSchema.params),
          RESULT: this.buildResultSection(methodSchema.result),
          ERRORS: this.buildErrorsSection(methodSchema.errors)
        }) + "\n";
    }

    return methodsDocumentation;
  }

  buildDescriptionSection(descripton) {
    if (!descripton) {
      return "";
    }

    return "### Description\n" + this.normalizeDescription(descripton) + "\n\n";
  }

  buildParamsSection(paramsSchema) {
    if (!paramsSchema) {
      return "";
    }

    var paramsPropertyList = [];
    this.utils.parsePropertyList("params", paramsSchema).forEach(item => {
      paramsPropertyList.push([item.name, item.type, item.description]);
    });

    return (
      "### Parameters\n" +
      this.markdowntable(
        [["Name", "Type", "Description"]].concat(paramsPropertyList)
      ) +
      "\n\n"
    );
  }

  buildResultSection(resultSchema) {
    if (!resultSchema) {
      return "";
    }

    var resultPropertyList = [];
    this.utils.parsePropertyList("result", resultSchema).forEach(item => {
      resultPropertyList.push([item.name, item.type, item.description]);
    });

    return (
      "### Result\n" +
      this.markdowntable(
        [["Name", "Type", "Description"]].concat(resultPropertyList)
      ) +
      "\n\n"
    );
  }

  buildErrorsSection(errorsSchema) {
    if (!errorsSchema || !errorsSchema.length) {
      return "";
    }

    var errorsPropertyList = [];
    errorsSchema.forEach(item => {
      errorsPropertyList.push([item.code, item.message, item.description]);
    });

    return (
      "### Errors\n" +
      this.markdowntable(
        [["Code", "Message", "Description"]].concat(errorsPropertyList)
      ) +
      "\n\n"
    );
  }

  buildToc(methodsSchema) {
    var toc = "";

    for (var methodName in methodsSchema) {
      toc += "* [" + methodName + "](#" + methodName + ")\n";
    }

    return toc;
  }
};
