const fs = require('fs');
const path = require('path');
const utils = require(path.join(__dirname, "../../../", 'utils.js'));

const templateDir = path.join(__dirname, 'templates');
const templates = {
  'base': fs.readFileSync(path.join(templateDir, 'base.js'), {
    encoding: 'utf8'
  }),
  'method': fs.readFileSync(path.join(templateDir, 'method.js'), {
    encoding: 'utf8'
  })
};

exports.generate = (schemas) => {

  var schema = utils.mergeSchemas(schemas);

  var artifacts = {};
  artifacts[schema.info.title + 'Server.js'] = Buffer.from(buildServer(schema), 'utf-8');
  return artifacts;
}

var buildServer = (schema) => {

  var methods = '';

  Object.keys(schema.methods).forEach((key) => {

    var resultSchema = schema.methods[key].result;

    methods += utils.populateTemplate(templates.method, {
      'METHOD': key,
      'RESULT': JSON.stringify(utils.generateExample(resultSchema), null, 4)
    });

    methods += '\n';
  });

  return utils.populateTemplate(templates.base, {
    'CONTENT': methods,
  });
}
