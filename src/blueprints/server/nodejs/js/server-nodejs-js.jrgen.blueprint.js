const path = require("path");
const utils = require(path.join(__dirname, "../../../../", "utils.js"));

module.exports = (schema) => {
  return {
    templates: Object.entries(
      utils.loadFileTreeFrom(path.join(__dirname, "templates"))
    ).reduce((acc, [templatePath, templateValue]) => {
      if (templatePath.endsWith("api-server.js.mustache")) {
        templatePath = `${schema.info.title
          .toLowerCase()
          .replace(/\s/g, "-")}-server.js.mustache`;
      }
      acc[templatePath] = templateValue;
      return acc;
    }, {}),
    model: {
      methods: Object.keys(schema.methods).map((key) => {
        const methodSchema = schema.methods[key];
        return {
          rpcName: key,
          result: JSON.stringify(
            utils.generateExample(methodSchema.result),
            null,
            2
          ),
        };
      }),
    },
  };
};
