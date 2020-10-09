const fs = require("fs-extra");
const path = require("path");
const $RefParser = require("json-schema-ref-parser");
const jsonlint = require("jsonlint");
const prettier = require("prettier");
const glob = require("glob");
const mustache = require("mustache");

exports.loadFileTreeFrom = (inputPath) => {
  const fileTree = {};
  glob
    .sync(`${inputPath}/**/*`)
    .filter((filePath) => {
      return fs.lstatSync(filePath).isFile();
    })
    .forEach((filePath) => {
      fileTree[path.relative(inputPath, filePath)] = fs.readFileSync(filePath, {
        encoding: "utf8",
      });
    });
  return fileTree;
};

exports.saveFileTreeTo = (fileTree, outputPath) => {
  outputPath = path.normalize(outputPath || process.cwd());

  Object.keys(fileTree).forEach((relativeFilePath) => {
    fs.outputFile(
      path.join(outputPath, relativeFilePath),
      fileTree[relativeFilePath]
    );
  });
};

exports.normalizeMultiLineString = (multiLineString, separator) => {
  if (!multiLineString) {
    return "";
  }
  if (Array.isArray(multiLineString)) {
    return multiLineString.join(separator || "\n");
  }
  return multiLineString.toString();
};

exports.gatherBlueprints = () => {
  return glob
    .sync(__dirname + "/../../jrgen*/**/*.jrgen.blueprint.js")
    .reduce((acc, blueprintPath) => {
      const blueprintId = path.basename(blueprintPath, ".jrgen.blueprint.js");
      acc[blueprintId] = blueprintPath;
      return acc;
    }, {});
};

exports.generateRequestExample = (methodName, paramsSchema) => {
  return JSON.stringify(
    {
      jsonrpc: "2.0",
      id: "1234567890",
      method: methodName,
      params: exports.generateExample(paramsSchema),
    },
    null,
    2
  );
};

exports.generateResponseExample = (resultSchema) => {
  return JSON.stringify(
    {
      jsonrpc: "2.0",
      id: "1234567890",
      result: exports.generateExample(resultSchema),
    },
    null,
    2
  );
};

exports.generateExample = (schema) => {
  if (!schema) {
    return;
  }

  let example;

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
  } else if (schema.examples !== undefined) {
    example = schema.default === undefined ? schema.examples[0] : schema.default;
  } else {
    example = schema.default === undefined ? schema.example : schema.default;
  }

  return example;
};

exports.parsePropertyList = (name, schema) => {
  if (!schema) {
    return [];
  }

  let entries = [];

  entries.push({
    name: name,
    type: schema.type,
    description: schema.description || "",
    schema: JSON.stringify(schema, null, 2),
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
        exports.parsePropertyList(name + "[]", schema.items)
      );
    }
  } else if (schema.type === "object") {
    Object.keys(schema.properties).forEach((key) => {
      let connector = "?.";
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

exports.resolveSchemaRefs = async (schema) => {
  return new Promise((resolve) => {
    $RefParser.dereference(schema, (error, schema) => {
      if (error) {
        throw error;
      }
      resolve(schema);
    });
  });
};

exports.loadSchema = (schemaPath) => {
  if (!path.isAbsolute(schemaPath)) {
    schemaPath = path.join(process.cwd(), schemaPath);
  }

  const jsonString = fs.readFileSync(schemaPath, {
    encoding: "utf8",
  });

  const schema = jsonlint.parse(jsonString);

  const resolvedSchema = exports.resolveSchemaRefs(schema);

  return resolvedSchema;
};

exports.prettifyFileTree = (fileTree) => {
  Object.keys(fileTree).forEach((key) => {
    let parser;
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
      fileTree[key] = Buffer.from(
        prettier.format(fileTree[key].toString(), {
          parser,
        }),
        "utf-8"
      );
    }
  });
};

exports.buildArtifacts = (artifactsBlueprint) => {
  const artifacts = {};

  const templateKeys = Object.keys(artifactsBlueprint.templates);
  for (const templateKey of templateKeys) {
    let artifact = artifactsBlueprint.templates[templateKey];
    let artifactPath = templateKey;

    if (templateKey.endsWith(".mustache")) {
      artifact = mustache.render(
        artifactsBlueprint.templates[templateKey],
        artifactsBlueprint.model
      );
      artifactPath = artifactPath.replace(/\.mustache$/, "");
    }

    artifacts[artifactPath] = Buffer.from(artifact, "utf-8");
  }

  return artifacts;
};
