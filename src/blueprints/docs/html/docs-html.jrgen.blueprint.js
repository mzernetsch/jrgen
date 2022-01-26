const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));

module.exports = (schema) => {
  return {
    templates: Object.entries(
      utils.loadFileTreeFrom(path.join(__dirname, "templates"))
    ).reduce((acc, [templatePath, templateValue]) => {
      if (templatePath.endsWith("api-reference.html.mustache")) {
        templatePath = `${schema.info.title
          .toLowerCase()
          .replace(/\s/g, "-")}-reference.html.mustache`;
      }
      acc[templatePath] = templateValue;
      return acc;
    }, {}),
    model: {
      title: schema.info.title,
      version: schema.info.version,
      description: utils.normalizeMultiLineString(
        schema.info.description,
        "<br/>"
      ),
      methods: Object.keys(schema.methods).map((key) => {
        const methodSchema = schema.methods[key];
        let example = {
          id: key.replace(/\./g, "_"),
          name: key,
          summary: methodSchema.summary,
          description: utils.normalizeMultiLineString(
            methodSchema.description,
            "<br/>"
          ),
          constraints: methodSchema.constraints,
          tags: methodSchema.tags,
          params: utils.parsePropertyList("params", methodSchema.params),
          result: utils.parsePropertyList("result", methodSchema.result),
          errors: methodSchema.errors,
          requestExample: utils.generateRequestExample(
            methodSchema.type,
            key,
            methodSchema.params
          ),
        };

        if (methodSchema.type !== "notify") {
          example["responseExample"] =
            utils.generateResponseExample(methodSchema.result);
        }

        return example;
      }),
    },
  };
};
