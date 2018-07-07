const fs = require("fs");
const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));

const templateDir = path.join(__dirname, "templates");
const templates = utils.loadTemplates(templateDir);

exports.generate = schemas => {
  return new Promise((resolve, reject) => {
    var schema = utils.mergeSchemas(schemas);

    var artifacts = {};
    artifacts[schema.info.title + ".html"] = Buffer.from(
      buildDocumentation(schema),
      "utf-8"
    );
    resolve(artifacts);
  });
};

var normalizeDescription = description => {
  if (Array.isArray(description)) {
    return description.join("<br>");
  }
  return description.toString();
};

var buildDocumentation = schema => {
  return utils.populateTemplate(templates["base.html"], {
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

    methodsDocumentation += utils.populateTemplate(templates["method.html"], {
      METHOD: methodName,
      ID: methodName.replace(/\./g, "_"),
      SUMMARY: methodSchema.summary,
      EXAMPLE_REQUEST: encodeURIComponent(
        utils.generateRequestExample(methodName, methodSchema.params)
      ),
      EXAMPLE_RESPONSE: encodeURIComponent(
        utils.generateResponseExample(methodSchema.result)
      ),
      DESCRIPTION: buildDescriptionSection(methodSchema.description),
      PARAMETERS: buildParamsSection(methodSchema.params),
      RESULT: buildResultSection(methodSchema.result),
      ERRORS: buildErrorsSection(methodSchema.errors),
      TAGS: buildTagBadges(methodSchema.tags)
    });
  }

  return methodsDocumentation;
};

var buildToc = methodsSchema => {
  var entries = "";

  for (var methodName in methodsSchema) {
    entries += utils.populateTemplate(templates["toc-entry.html"], {
      TARGET: methodName.replace(/\./g, "_"),
      TITLE: methodName
    });
  }

  return utils.populateTemplate(templates["toc.html"], {
    CONTENT: entries
  });
};

var buildTagBadges = tags => {
  if (!tags) {
    return "";
  }

  var badges = "";

  tags.forEach(item => {
    badges += utils.populateTemplate(templates["tag.html"], {
      TITLE: item
    });
  });

  return badges;
};

var buildDescriptionSection = descripton => {
  if (!descripton) {
    return "";
  }

  return utils.populateTemplate(templates["description.html"], {
    CONTENT: normalizeDescription(descripton)
  });
};

var buildParamsSection = paramsSchema => {
  if (!paramsSchema) {
    return "";
  }

  var paramsPropertyList = "";
  utils.parsePropertyList("params", paramsSchema).forEach(item => {
    paramsPropertyList += utils.populateTemplate(templates["parameter.html"], {
      NAME: item.name,
      TYPE: item.type,
      DESCRIPTION: item.description,
      SCHEMA: JSON.stringify(item.schema, null, 2).replace(/"/g, "'")
    });
  });

  return utils.populateTemplate(templates["parameters.html"], {
    CONTENT: paramsPropertyList
  });
};

var buildResultSection = resultSchema => {
  if (!resultSchema) {
    return "";
  }

  var resultPropertyList = "";
  utils.parsePropertyList("result", resultSchema).forEach(item => {
    resultPropertyList += utils.populateTemplate(templates["parameter.html"], {
      NAME: item.name,
      TYPE: item.type,
      DESCRIPTION: item.description,
      SCHEMA: JSON.stringify(item.schema, null, 4).replace(/"/g, "'")
    });
  });

  return utils.populateTemplate(templates["result.html"], {
    CONTENT: resultPropertyList
  });
};

var buildErrorsSection = errorsSchema => {
  if (!errorsSchema || !errorsSchema.length) {
    return "";
  }

  var errorsPropertyList = "";
  errorsSchema.forEach(item => {
    errorsPropertyList += utils.populateTemplate(templates["error.html"], {
      CODE: item.code,
      MESSAGE: item.message,
      DESCRIPTION: item.description,
      SCHEMA: JSON.stringify(item, null, 4).replace(/"/g, "'")
    });
  });

  return utils.populateTemplate(templates["errors.html"], {
    CONTENT: errorsPropertyList
  });
};
