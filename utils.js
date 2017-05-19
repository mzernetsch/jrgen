var fs = require('fs');
var path = require('path');
var $RefParser = require('json-schema-ref-parser');
var jsonlint = require("jsonlint");
var merge = require('deepmerge');

exports.populateTemplate = (template, values) => {
  var text = new String(template);

  Object.keys(values).forEach(function(key) {
    var regex = new RegExp("{{" + key + "}}", "g");
    text = text.replace(regex, values[key]);
  });

  return text;
}

exports.generateRequestExample = (method, paramsSchema) => {

  var example = exports.generateExample(paramsSchema);

  var exampleRequest = {
    jsonrpc: '2.0',
    id: Math.random().toString(16).slice(2),
    method: method,
    params: example === null ? undefined : example
  }

  return JSON.stringify(exampleRequest, null, 4);
}

exports.generateResponseExample = (resultSchema) => {

  var example = exports.generateExample(resultSchema);

  var exampleResponse = {
    jsonrpc: '2.0',
    id: Math.random().toString(16).slice(2),
    result: example === null ? undefined : example
  }

  return JSON.stringify(exampleResponse, null, 4);
}

exports.generateExample = (schema) => {

  if (!schema) {
    return;
  }

  var example = null;

  if (schema.type === "object") {
    example = {};

    Object.keys(schema.properties).forEach(function(key) {
      example[key] = exports.generateExample(schema.properties[key]);
    });
  }
  else if (schema.type === "array") {
    example = [exports.generateExample(schema.items)];
  }
  else {
    example = schema.example;
  }

  return example;
}

exports.resolveSchemaRefs = (schema) => {

  var data;
  var done = false;

  $RefParser.dereference(schema, function(error, schema) {
    if (error) {
      throw error;
    }
    data = schema;
    done = true;
  });

  require('deasync').loopWhile(function() {
    return !done;
  });

  return data;
}

exports.loadSchema = (schemaPath) => {

  //Normalize relative paths
  if (!path.isAbsolute(schemaPath)) {
    schemaPath = path.join(process.cwd(), schemaPath);
  }

  //Load schema
  var jsonString = fs.readFileSync(schemaPath, {
    encoding: 'utf8'
  });

  if (!jsonString) {
    throw "Error occured during loading schema."
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
}

exports.loadSchemas = (schemaPaths) => {

  var apiSchema = {};

  //Go through all schema paths
  schemaPaths.forEach((schemaPath) => {

    //Load schema
    var schema = exports.loadSchema(schemaPath);

    //Merge schema
    apiSchema = merge(apiSchema, schema);
  });

  return apiSchema;
}
