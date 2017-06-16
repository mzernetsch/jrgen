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

exports.generate = (schemas, outdir) => {

  var schema = utils.mergeSchemas(schemas);

  //Create output hierarchy
  var outdirSpec = path.join(outdir, 'spec');
  var outdirSupport = path.join(outdirSpec, 'support');
  var outdirHelpers = path.join(outdirSupport, 'helpers');

  //Create sub outdir
  try {
    fs.mkdirSync(outdirSpec);
    fs.mkdirSync(outdirSupport);
    fs.mkdirSync(outdirHelpers);
  }
  catch (e) {}

  //Create output dir
  fs.writeFileSync(path.join(outdir, 'package.json'), buildPackage(schema));
  fs.writeFileSync(path.join(outdir, 'config.json'), buildConfig(schema));
  fs.writeFileSync(path.join(outdirSpec, schema.info.title + '.spec.js'), buildSpec(schema));
  fs.writeFileSync(path.join(outdirSupport, 'jasmine.json'), buildJasmine(schema));
  fs.writeFileSync(path.join(outdirHelpers, 'SpecHelper.js'), buildHelper(schema));
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
