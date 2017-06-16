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

exports.generate = (schemas, outdir) => {

  var schema = utils.mergeSchemas(schemas);

  fs.writeFileSync(path.join(outdir, schema.info.title + 'Server.js'), buildServer(schema));
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
