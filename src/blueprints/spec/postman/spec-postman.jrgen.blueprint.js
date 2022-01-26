const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));
const uuidv5 = require("uuid").v5;

module.exports = (schema) => {
  return {
    templates: Object.entries(
      utils.loadFileTreeFrom(path.join(__dirname, "templates"))
    ).reduce((acc, [templatePath, templateValue]) => {
      if (templatePath.endsWith("api.postman_collection.json.mustache")) {
        templatePath = `${schema.info.title
          .toLowerCase()
          .replace(/\s/g, "-")}.postman_collection.json.mustache`;
      }
      acc[templatePath] = templateValue;
      return acc;
    }, {}),
    model: {
      postmanId: uuidv5.URL,
      title: schema.info.title,
      description: JSON.stringify(
        utils.normalizeMultiLineString(schema.info.description)
      ),
      methods: Object.keys(schema.methods).map((key) => {
        const methodSchema = schema.methods[key];
        return {
          name: key,
          description: methodSchema.description || methodSchema.summary,
          responseSchema: JSON.stringify({
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              jsonrpc: {
                type: "string",
                enum: ["2.0"],
              },
              result: methodSchema.result,
            },
            required: ["id", "jsonrpc", "result"],
          }).replace(/"/g, `\\"`),
          requestExample: JSON.stringify(
            utils.generateRequestExample(
              methodSchema.type,
              key,
              methodSchema.params)
          ),
        };
      }),
    },
  };
};
