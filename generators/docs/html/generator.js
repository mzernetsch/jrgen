const fs = require("fs");
const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));

const templateDir = path.join(__dirname, "templates");
const templates = {
  base: fs.readFileSync(path.join(templateDir, "base.html"), {
    encoding: "utf8"
  }),
  method: fs.readFileSync(path.join(templateDir, "method.html"), {
    encoding: "utf8"
  }),
  description: fs.readFileSync(path.join(templateDir, "description.html"), {
    encoding: "utf8"
  }),
  parameters: fs.readFileSync(path.join(templateDir, "parameters.html"), {
    encoding: "utf8"
  }),
  property: fs.readFileSync(path.join(templateDir, "parameter.html"), {
    encoding: "utf8"
  }),
  result: fs.readFileSync(path.join(templateDir, "result.html"), {
    encoding: "utf8"
  }),
  errors: fs.readFileSync(path.join(templateDir, "errors.html"), {
    encoding: "utf8"
  }),
  error: fs.readFileSync(path.join(templateDir, "error.html"), {
    encoding: "utf8"
  }),
  tag: fs.readFileSync(path.join(templateDir, "tag.html"), {
    encoding: "utf8"
  }),
  toc: fs.readFileSync(path.join(templateDir, "toc.html"), {
    encoding: "utf8"
  }),
  toc_entry: fs.readFileSync(path.join(templateDir, "toc-entry.html"), {
    encoding: "utf8"
  })
};

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

var buildDocumentation = schema => {
  //Build docs
  return utils.populateTemplate(templates.base, {
    TITLE: schema.info.title,
    DESCRIPTION: schema.info.description,
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

    //Build method block
    methodsDocumentation += utils.populateTemplate(templates.method, {
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
    entries += utils.populateTemplate(templates.toc_entry, {
      TARGET: methodName.replace(/\./g, "_"),
      TITLE: methodName
    });
  }

  return utils.populateTemplate(templates.toc, {
    CONTENT: entries
  });
};

var buildTagBadges = tags => {
  if (!tags) {
    return "";
  }

  var badges = "";

  tags.forEach(item => {
    badges += utils.populateTemplate(templates.tag, {
      TITLE: item
    });
  });

  return badges;
};

var buildDescriptionSection = descripton => {
  if (!descripton) {
    return "";
  }

  return utils.populateTemplate(templates.description, {
    CONTENT: descripton
  });
};

var buildParamsSection = paramsSchema => {
  if (!paramsSchema) {
    return "";
  }

  var paramsPropertyList = "";
  parsePropertyList("params", paramsSchema).forEach(item => {
    paramsPropertyList += utils.populateTemplate(templates.property, {
      NAME: item.name,
      TYPE: item.type,
      DESCRIPTION: item.description,
      SCHEMA: JSON.stringify(item.schema, null, 2).replace(/"/g, "'")
    });
  });

  return utils.populateTemplate(templates.parameters, {
    CONTENT: paramsPropertyList
  });
};

var buildResultSection = resultSchema => {
  if (!resultSchema) {
    return "";
  }

  var resultPropertyList = "";
  parsePropertyList("result", resultSchema).forEach(item => {
    resultPropertyList += utils.populateTemplate(templates.property, {
      NAME: item.name,
      TYPE: item.type,
      DESCRIPTION: item.description,
      SCHEMA: JSON.stringify(item.schema, null, 4).replace(/"/g, "'")
    });
  });

  return utils.populateTemplate(templates.result, {
    CONTENT: resultPropertyList
  });
};

var buildErrorsSection = errorsSchema => {
  if (!errorsSchema || !errorsSchema.length) {
    return "";
  }

  var errorsPropertyList = "";
  errorsSchema.forEach(item => {
    errorsPropertyList += utils.populateTemplate(templates.error, {
      CODE: item.code,
      MESSAGE: item.message,
      DESCRIPTION: item.description,
      SCHEMA: JSON.stringify(item, null, 4).replace(/"/g, "'")
    });
  });

  return utils.populateTemplate(templates.errors, {
    CONTENT: errorsPropertyList
  });
};

var parsePropertyList = (name, schema) => {
  if (!schema) {
    return [];
  }

  var entries = [];

  entries.push({
    name: name,
    type: schema.type,
    description: schema.description || "",
    schema: schema
  });

  if (schema.type === "array") {
    entries = entries.concat(parsePropertyList(name + "[#]", schema.items));
  } else if (schema.type === "object") {
    Object.keys(schema.properties).forEach(key => {
      var connector = "?.";
      if (schema.required && schema.required.includes(key)) {
        connector = ".";
      }
      entries = entries.concat(
        parsePropertyList(name + connector + key, schema.properties[key])
      );
    });
  }

  return entries;
};
