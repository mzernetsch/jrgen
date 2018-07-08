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
      artifacts[schema.info.title + ".html"] = Buffer.from(
        this.buildDocumentation(schema),
        "utf-8"
      );
      resolve(artifacts);
    });
  }

  normalizeDescription(description) {
    if (Array.isArray(description)) {
      return description.join("<br>");
    }
    return description.toString();
  }

  buildDocumentation(schema) {
    return this.utils.populateTemplate(this.templates["base.html"], {
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

      methodsDocumentation += this.utils.populateTemplate(
        this.templates["method.html"],
        {
          METHOD: methodName,
          ID: methodName.replace(/\./g, "_"),
          SUMMARY: methodSchema.summary,
          EXAMPLE_REQUEST: encodeURIComponent(
            this.utils.generateRequestExample(methodName, methodSchema.params)
          ),
          EXAMPLE_RESPONSE: encodeURIComponent(
            this.utils.generateResponseExample(methodSchema.result)
          ),
          DESCRIPTION: this.buildDescriptionSection(methodSchema.description),
          PARAMETERS: this.buildParamsSection(methodSchema.params),
          RESULT: this.buildResultSection(methodSchema.result),
          ERRORS: this.buildErrorsSection(methodSchema.errors),
          TAGS: this.buildTagBadges(methodSchema.tags)
        }
      );
    }

    return methodsDocumentation;
  }

  buildToc(methodsSchema) {
    var entries = "";

    for (var methodName in methodsSchema) {
      entries += this.utils.populateTemplate(this.templates["toc-entry.html"], {
        TARGET: methodName.replace(/\./g, "_"),
        TITLE: methodName
      });
    }

    return this.utils.populateTemplate(this.templates["toc.html"], {
      CONTENT: entries
    });
  }

  buildTagBadges(tags) {
    if (!tags) {
      return "";
    }

    var badges = "";

    tags.forEach(item => {
      badges += this.utils.populateTemplate(this.templates["tag.html"], {
        TITLE: item
      });
    });

    return badges;
  }

  buildDescriptionSection(descripton) {
    if (!descripton) {
      return "";
    }

    return this.utils.populateTemplate(this.templates["description.html"], {
      CONTENT: this.normalizeDescription(descripton)
    });
  }

  buildParamsSection(paramsSchema) {
    if (!paramsSchema) {
      return "";
    }

    var paramsPropertyList = "";
    this.utils.parsePropertyList("params", paramsSchema).forEach(item => {
      paramsPropertyList += this.utils.populateTemplate(
        this.templates["parameter.html"],
        {
          NAME: item.name,
          TYPE: item.type,
          DESCRIPTION: item.description,
          SCHEMA: JSON.stringify(item.schema, null, 2).replace(/"/g, "'")
        }
      );
    });

    return this.utils.populateTemplate(this.templates["parameters.html"], {
      CONTENT: paramsPropertyList
    });
  }

  buildResultSection(resultSchema) {
    if (!resultSchema) {
      return "";
    }

    var resultPropertyList = "";
    this.utils.parsePropertyList("result", resultSchema).forEach(item => {
      resultPropertyList += this.utils.populateTemplate(
        this.templates["parameter.html"],
        {
          NAME: item.name,
          TYPE: item.type,
          DESCRIPTION: item.description,
          SCHEMA: JSON.stringify(item.schema, null, 4).replace(/"/g, "'")
        }
      );
    });

    return this.utils.populateTemplate(this.templates["result.html"], {
      CONTENT: resultPropertyList
    });
  }

  buildErrorsSection(errorsSchema) {
    if (!errorsSchema || !errorsSchema.length) {
      return "";
    }

    var errorsPropertyList = "";
    errorsSchema.forEach(item => {
      errorsPropertyList += this.utils.populateTemplate(
        this.templates["error.html"],
        {
          CODE: item.code,
          MESSAGE: item.message,
          DESCRIPTION: item.description,
          SCHEMA: JSON.stringify(item, null, 4).replace(/"/g, "'")
        }
      );
    });

    return this.utils.populateTemplate(this.templates["errors.html"], {
      CONTENT: errorsPropertyList
    });
  }
};
