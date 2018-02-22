const fs = require("fs-extra");
const path = require("path");
const $RefParser = require("json-schema-ref-parser");
const jsonlint = require("jsonlint");
const merge = require("deepmerge");
const prettier = require("prettier");

exports.populateTemplate = (template, values) => {
  var text = new String(template);

  Object.keys(values).forEach(key => {
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
    params: example === null ? undefined : example
  };

  return JSON.stringify(exampleRequest, null, 4);
};

exports.generateResponseExample = resultSchema => {
  var example = exports.generateExample(resultSchema);

  var exampleResponse = {
    jsonrpc: "2.0",
    id: "1234567890",
    result: example === null ? undefined : example
  };

  return JSON.stringify(exampleResponse, null, 4);
};

exports.generateExample = schema => {
  if (!schema) {
    return;
  }

  var example = null;

  if (schema.type === "object") {
    example = {};

    Object.keys(schema.properties).forEach(key => {
      example[key] = exports.generateExample(schema.properties[key]);
    });
  } else if (schema.type === "array") {
    example = [exports.generateExample(schema.items)];
  } else {
    example = schema.default === undefined ? schema.example : schema.default;
  }

  return example;
};

exports.resolveSchemaRefs = schema => {
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

exports.loadSchema = schemaPath => {
  //Normalize relative paths
  if (!path.isAbsolute(schemaPath)) {
    schemaPath = path.join(process.cwd(), schemaPath);
  }

  //Load schema
  var jsonString = fs.readFileSync(schemaPath, {
    encoding: "utf8"
  });

  if (!jsonString) {
    throw "Error occured during loading schema.";
  }

  //Parse schema
  var schema = jsonlint.parse(jsonString);
  if (!schema) {
    throw "Specified schema does not exist.";
  }

  //Resolve schema refs
  var resolvedSchema = exports.resolveSchemaRefs(schema);
  if (!resolvedSchema) {
    throw "Error occured during resolving schema $refs.";
  }

  return resolvedSchema;
};

exports.loadSchemas = schemaPaths => {
  var schemas = [];

  //Go through all schema paths
  schemaPaths.forEach(schemaPath => {
    //Load schema
    schemas.push(exports.loadSchema(schemaPath));
  });

  return schemas;
};

exports.mergeSchemas = schemas => {
  var apiSchema = {};

  //Go through all schemas
  schemas.forEach(schema => {
    //Merge schema
    apiSchema = merge(apiSchema, schema);
  });

  return apiSchema;
};

exports.writeArtifacts = (artifacts, outdir) => {
  Object.keys(artifacts).forEach(artifactPath => {
    fs.outputFile(path.join(outdir, artifactPath), artifacts[artifactPath]);
  });
};

exports.prettifyArtifacts = artifacts => {
  Object.keys(artifacts).forEach(key => {
    var parser;
    if (key.endsWith(".js")) {
      parser = "babylon";
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
          parser
        }),
        "utf-8"
      );
    }
  });
};
