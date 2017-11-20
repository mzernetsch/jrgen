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

  return new Promise((resolve, reject) => {
    
    var schema = utils.mergeSchemas(schemas);

    var artifacts = {};
    artifacts[schema.info.title + 'Client.js'] = Buffer.from(buildClient(schema), 'utf-8');
    resolve(artifacts);
  });
}

var buildClient = (schema) => {

  var methods = '';
  Object.keys(schema.methods).forEach((key) => {
    methods += utils.populateTemplate(templates.method, {
      'METHOD': key,
      'METHOD_NAME': key.replace(/\./g, '_'),
    });
  });

  return utils.populateTemplate(templates.base, {
    'CONTENT': methods
  });
}
