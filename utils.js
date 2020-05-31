const fs = require("fs-extra");
const path = require("path");
const $RefParser = require("json-schema-ref-parser");
const jsonlint = require("jsonlint");
const merge = require("deepmerge");
const prettier = require("prettier");
const glob = require("glob");

exports.findGenerators = (generatorId) => {
  var generators = {};

  var loadPlugin = (pluginFolderPath) => {
    var generatorsFolderPath = path.join(pluginFolderPath, "generators");
    fs.readdirSync(generatorsFolderPath).forEach((categoryName) => {
      var categoryFolderPath = path.join(generatorsFolderPath, categoryName);
      fs.readdirSync(categoryFolderPath).forEach((generatorName) => {
        var generatorPath = path.join(
          categoryFolderPath,
          generatorName,
          "generator.js"
        );
        if (fs.existsSync(generatorPath)) {
          generators[categoryName + "/" + generatorName] = generatorPath;
        }
      });
    });
  };

  var parsePlugins = (pluginsFolderPath) => {
    fs.readdirSync(pluginsFolderPath).forEach((pluginName) => {
      var pluginFolderPath = path.join(pluginsFolderPath, pluginName);
      if (pluginName.startsWith("jrgen-plugin-")) {
        loadPlugin(pluginFolderPath);
      } else if (pluginName.startsWith("@")) {
        parsePlugins(pluginFolderPath);
      }
    });
  };

  loadPlugin(__dirname);
  parsePlugins(path.join(__dirname, ".."));

  return generators;
};

exports.populateTemplate = (template, values) => {
  var text = new String(template);

  Object.keys(values).forEach((key) => {
    var regex = new RegExp("{{" + key + "}}", "g");
    text = text.replace(regex, values[key]);
  });

  return text;
};

exports.generateRequestExample = (method, paramsSchema) => {
  var example = exports.generateExample(paramsSchema);

  var exampleRequest = {
    jsonrpc: "2.0",
    id: "1234567890",
    method: method,
    params: example === null ? undefined : example,
  };

  return JSON.stringify(exampleRequest, null, 4);
};

exports.generateResponseExample = (resultSchema) => {
  var example = exports.generateExample(resultSchema);

  var exampleResponse = {
    jsonrpc: "2.0",
    id: "1234567890",
    result: example === null ? undefined : example,
  };

  return JSON.stringify(exampleResponse, null, 4);
};

exports.generateExample = (schema) => {
  if (!schema) {
    return;
  }

  var example = null;

  if (schema.type === "object") {
    example = {};

    Object.keys(schema.properties).forEach((key) => {
      example[key] = exports.generateExample(schema.properties[key]);
    });
  } else if (schema.type === "array") {
    if (schema.default !== undefined || schema.example !== undefined) {
      example = schema.default === undefined ? schema.example : schema.default;
    } else if (Array.isArray(schema.items)) {
      example = schema.items.map((item) => exports.generateExample(item));
    } else {
      example = [exports.generateExample(schema.items)];
    }
  } else {
    example = schema.default === undefined ? schema.example : schema.default;
  }

  return example;
};

exports.parsePropertyList = (name, schema) => {
  if (!schema) {
    return [];
  }

  var entries = [];

  entries.push({
    name: name,
    type: schema.type,
    description: schema.description || "",
    schema: schema,
  });

  if (schema.type === "array") {
    if (Array.isArray(schema.items)) {
      schema.items.forEach((item, index) => {
        let selector = index;
        if (item.name) {
          selector += ":" + item.name;
        }
        entries = entries.concat(
          exports.parsePropertyList(name + "[" + selector + "]", item)
        );
      });
    } else {
      entries = entries.concat(
        exports.parsePropertyList(name + "[#]", schema.items)
      );
    }
  } else if (schema.type === "object") {
    Object.keys(schema.properties).forEach((key) => {
      var connector = "?.";
      if (schema.required && schema.required.includes(key)) {
        connector = ".";
      }
      entries = entries.concat(
        exports.parsePropertyList(
          name + connector + key,
          schema.properties[key]
        )
      );
    });
  }

  return entries;
};

exports.resolveSchemaRefs = (schema) => {
  var data;
  var done = false;

  $RefParser.dereference(schema, (error, schema) => {
    if (error) {
      throw error;
    }
    data = schema;
    done = true;
  });

  require("deasync").loopWhile(() => {
    return !done;
  });

  return data;
};

exports.loadSchema = (schemaPath) => {
  if (!path.isAbsolute(schemaPath)) {
    schemaPath = path.join(process.cwd(), schemaPath);
  }

  var jsonString = fs.readFileSync(schemaPath, {
    encoding: "utf8",
  });

  if (!jsonString) {
    throw "Error occured during loading schema.";
  }

  var schema = jsonlint.parse(jsonString);
  if (!schema) {
    throw "Specified schema does not exist.";
  }

  var resolvedSchema = exports.resolveSchemaRefs(schema);
  if (!resolvedSchema) {
    throw "Error occured during resolving schema $refs.";
  }

  return resolvedSchema;
};

exports.loadSchemas = (schemaPaths) => {
  var schemas = [];

  schemaPaths.forEach((schemaPath) => {
    schemas.push(exports.loadSchema(schemaPath));
  });

  return schemas;
};

exports.mergeSchemas = (schemas) => {
  var apiSchema = {};

  schemas.forEach((schema) => {
    apiSchema = merge(apiSchema, schema);
  });

  return apiSchema;
};

exports.loadTemplates = (templateDir) => {
  const templates = {};

  const templatesPaths = glob.sync(templateDir + "/**/*");
  templatesPaths
    .filter((templatePath) => {
      return fs.lstatSync(templatePath).isFile();
    })
    .forEach((templatePath) => {
      templates[path.relative(templateDir, templatePath)] = fs.readFileSync(
        templatePath,
        {
          encoding: "utf8",
        }
      );
    });

  return templates;
};

exports.writeArtifacts = (artifacts, outdir) => {
  Object.keys(artifacts).forEach((artifactPath) => {
    fs.outputFile(path.join(outdir, artifactPath), artifacts[artifactPath]);
  });
};

exports.prettifyArtifacts = (artifacts) => {
  Object.keys(artifacts).forEach((key) => {
    var parser;
    if (key.endsWith(".js")) {
      parser = "babel";
    }
    if (key.endsWith(".ts")) {
      parser = "typescript";
    }
    if (key.endsWith(".css") || key.endsWith(".scss")) {
      parser = "postcss";
    }
    if (key.endsWith(".json")) {
      parser = "json";
    }
    if (key.endsWith(".md")) {
      parser = "markdown";
    }
    if (parser) {
      artifacts[key] = Buffer.from(
        prettier.format(artifacts[key].toString(), {
          parser,
        }),
        "utf-8"
      );
    }
  });
};
