const path = require("path");
const utils = require(path.join(__dirname, "../../../../", "utils.js"));

module.exports = (schema) => {
  return {
    templates: Object.entries(
      utils.loadFileTreeFrom(path.join(__dirname, "templates"))
    ).reduce((acc, [templatePath, templateValue]) => {
      if (templatePath.endsWith("api-client.js.mustache")) {
        templatePath = `${schema.info.title
          .toLowerCase()
          .replace(/\s/g, "-")}-client.js.mustache`;
      }
      acc[templatePath] = templateValue;
      return acc;
    }, {}),
    model: {
      title: schema.info.title.replace(/\s/g, ""),
      methods: Object.keys(schema.methods).map((key) => {
        return {
          functionName: key.replace(/\./g, "_"),
          rpcName: key,
        };
      }),
    },
  };
};
