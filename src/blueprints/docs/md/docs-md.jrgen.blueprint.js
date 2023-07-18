const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));

module.exports = (schema) => {
  return {
    templates: Object.entries(
      utils.loadFileTreeFrom(path.join(__dirname, "templates"))
    ).reduce((acc, [templatePath, templateValue]) => {
      if (templatePath.endsWith("api-reference.md.mustache")) {
        templatePath = `${schema.info.title
          .toLowerCase()
          .replace(/\s/g, "-")}-reference.md.mustache`;
      }
      acc[templatePath] = templateValue;
      return acc;
    }, {}),
    model: {
      title: schema.info.title,
      version: schema.info.version,
      description: utils.normalizeMultiLineString(schema.info.description),
      servers: schema.info.servers,
      methods: Object.keys(schema.methods).map((key) => {
        const methodSchema = schema.methods[key];
        return {
          name: key,
          summary: methodSchema.summary,
          description: utils.normalizeMultiLineString(methodSchema.description),
          params: utils
            .parsePropertyList("params", methodSchema.params)
            .map((item) => {
              item.constraints = item.constraints.replace(/\|/g, "\\|");
              return item;
            }),
          result: utils.parsePropertyList("result", methodSchema.result),
          errors: methodSchema.errors,
          requestExample: utils.generateRequestExample(
            key,
            methodSchema.params
          ),
          responseExample: utils.generateResponseExample(methodSchema.result),
        };
      }),
    },
  };
};
