const json2ts = require("json-schema-to-typescript");
const path = require("path");
const utils = require(path.join(__dirname, "../../../../", "utils.js"));

buildTypes = async (schema) => {
  const json2tsOptions = {
    bannerComment: "",
    style: {
      singleQuote: true,
    },
  };

  let types = "";

  for (const key of Object.keys(schema.methods)) {
    if (schema.methods[key].params) {
      types +=
        (await json2ts.compile(
          schema.methods[key].params,
          key.replace(/\./g, "") + "RpcParams.json",
          json2tsOptions
        )) + "\n\n";
    }

    if (schema.methods[key].result) {
      types +=
        (await json2ts.compile(
          schema.methods[key].result,
          key.replace(/\./g, "") + "RpcResult.json",
          json2tsOptions
        )) + "\n\n";
    }
  }

  for (const key of Object.keys(schema.definitions)) {
    types +=
      (await json2ts.compile(
        schema.definitions[key],
        key.replace(/\./g, "") + ".json",
        json2tsOptions
      )) + "\n\n";
  }

  return types;
};

module.exports = async (schema) => {
  return {
    templates: Object.entries(
      utils.loadFileTreeFrom(path.join(__dirname, "templates"))
    ).reduce((acc, [templatePath, templateValue]) => {
      if (templatePath.endsWith("api-client.ts.mustache")) {
        templatePath = `${schema.info.title
          .toLowerCase()
          .replace(/\s/g, "-")}-client.ts.mustache`;
      }
      acc[templatePath] = templateValue;
      return acc;
    }, {}),
    model: {
      title: schema.info.title.replace(/\s/g, ""),
      methods: Object.keys(schema.methods).map((key) => {
        const methodSchema = schema.methods[key];
        return {
          functionName: key.replace(/\./g, "_"),
          rpcName: key,
          paramsType: methodSchema.params
            ? ":" + key.replace(/\./g, "") + "RpcParams"
            : "?:undefined",
          resultType: methodSchema.result
            ? key.replace(/\./g, "") + "RpcResult"
            : "undefined",
        };
      }),
      types: await buildTypes(schema),
    },
  };
};
