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

  for (const [methodName, methodSchema] of Object.entries(schema.methods)) {
    const methodTypeName = methodName.replace(/\./g, "");

    if (methodSchema.params) {
      types += await json2ts.compile(
        methodSchema.params,
        methodTypeName + "Params.json",
        json2tsOptions
      );

      types += `

        export type ${methodTypeName}Request = WithRequired<Request<"${methodName}", ${methodTypeName}Params>, "params">;

      `;
    } else {
      types += `
        export type ${methodTypeName}Params = void;

        export type ${methodTypeName}Request = Request<"${methodName}", ${methodTypeName}Params>;
      `;
    }

    if (methodSchema.result) {
      types +=
        (await json2ts.compile(
          methodSchema.result,
          methodTypeName + "Result.json",
          json2tsOptions
        )) + "\n\n";
    } else {
      types += `export type ${methodTypeName}Result = void;`;
    }

    types += `
      
        export type ${methodTypeName}Response = Response<"${methodName}", ${methodTypeName}Result>;

      `;

    if (methodSchema.errors) {
      const errorPrefix =
        schema.info.title.charAt(0).toUpperCase() +
        schema.info.title.replace(/\s/g, "").slice(1);

      const methodErrors = methodSchema.errors
        .map(
          (error) =>
            `typeof ${errorPrefix}ErrorCode.` + error.message.replace(/\s/g, "")
        )
        .join(" | ");

      types += `
        export type ${methodTypeName}ErrorCode = ${methodErrors};

        export type ${methodTypeName}Error = RpcError<${methodTypeName}ErrorCode>;
        
      `;
    }
  }

  for (const [schemaName, schemaDefinition] of Object.entries(
    schema.definitions
  )) {
    types +=
      (await json2ts.compile(
        schemaDefinition,
        schemaName.replace(/\./g, "") + ".json",
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
      title:
        schema.info.title.charAt(0).toUpperCase() +
        schema.info.title.replace(/\s/g, "").slice(1),
      methods: Object.keys(schema.methods).map((key) => key),
      methodTypes: Object.keys(schema.methods).map((key) =>
        key.replace(/\./g, "")
      ),
      methodTypesMap: Object.keys(schema.methods).map((key) => ({
        method: key,
        type: key.replace(/\./g, ""),
      })),
      additionalTypes: await buildTypes(schema),
      errors: Object.entries(
        Object.values(schema.methods).reduce((accumulator, methodSchema) => {
          methodSchema.errors?.forEach((error) => {
            accumulator[error.message.replace(/\s/g, "")] = error.code;
          });

          return accumulator;
        }, {})
      ).map(([key, value]) => ({
        code: value,
        message: key,
      })),
    },
  };
};
