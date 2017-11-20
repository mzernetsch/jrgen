const fs = require('fs');
const path = require('path');
const utils = require(path.join(__dirname, "../../../", 'utils.js'));

const templateDir = path.join(__dirname, 'templates');
const templates = {
  'base': fs.readFileSync(path.join(templateDir, 'base.js'), {
    encoding: 'utf8'
  }),
  'test': fs.readFileSync(path.join(templateDir, 'test.js'), {
    encoding: 'utf8'
  }),
  'config': fs.readFileSync(path.join(templateDir, 'config.json'), {
    encoding: 'utf8'
  }),
  'jasmine': fs.readFileSync(path.join(templateDir, 'jasmine.json'), {
    encoding: 'utf8'
  }),
  'package': fs.readFileSync(path.join(templateDir, 'package.json'), {
    encoding: 'utf8'
  }),
  'helper': fs.readFileSync(path.join(templateDir, 'SpecHelper.js'), {
    encoding: 'utf8'
  }),
};

exports.generate = (schemas) => {

  var schema = utils.mergeSchemas(schemas);

  var pathSpec = 'spec';
  var pathSupport = path.join(pathSpec, 'support');
  var pathHelpers = path.join(pathSupport, 'helpers');

  var artifacts = {};
  artifacts['package.json'] = Buffer.from(buildPackage(schema), 'utf-8');
  artifacts['config.json'] = Buffer.from(buildConfig(schema), 'utf-8');
  artifacts[path.join(pathSpec, schema.info.title + '.spec.js')] = Buffer.from(buildSpec(schema), 'utf-8');
  artifacts[path.join(pathSupport, 'jasmine.json')] = Buffer.from(buildJasmine(schema), 'utf-8');
  artifacts[path.join(pathHelpers, 'SpecHelper.js')] = Buffer.from(buildHelper(schema), 'utf-8');
  return artifacts;
}

var buildHelper = (schema) => {

  return utils.populateTemplate(templates.helper, {

  });
}

var buildJasmine = (schema) => {

  return utils.populateTemplate(templates.jasmine, {

  });
}

var buildPackage = (schema) => {

  return utils.populateTemplate(templates.package, {
    'TITLE': schema.info.title
  });
}

var buildSpec = (schema) => {

  var tests = '';
  Object.keys(schema.methods).forEach((key) => {
    tests += utils.populateTemplate(templates.test, {
      'METHOD': key,
      'RESULT_SCHEMA': JSON.stringify(schema.methods[key].result)
    });
  });

  return utils.populateTemplate(templates.base, {
    'TITLE': schema.info.title,
    'TESTS': tests
  });
}

var buildConfig = (schema) => {

  var methods = {}
  Object.keys(schema.methods).forEach((key) => {
    methods[key] = {
      params: utils.generateExample(schema.methods[key].params),
      expectError: false
    };
  });

  return utils.populateTemplate(templates.config, {
    'METHODS': JSON.stringify(methods, null, 4)
  });
}
