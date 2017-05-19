const fs = require('fs');
const path = require('path');
const json2ts = require('json-schema-to-typescript');
const utils = require(path.join(__dirname, "../../../", 'utils.js'));

const templateDir = path.join(__dirname, 'templates');
const templates = {
  'base': fs.readFileSync(path.join(templateDir, 'base.ts'), {
    encoding: 'utf8'
  }),
  'method': fs.readFileSync(path.join(templateDir, 'method.ts'), {
    encoding: 'utf8'
  })
};

exports.generate = (schema, outdir) => {

  fs.writeFileSync(path.join(outdir, schema.info.title + 'Client.ts'), buildClient(schema));
}

var buildClient = (schema) => {

  var types = '';
  var methods = '';
  Object.keys(schema.methods).forEach(function(key) {

    //Build method
    methods += buildRPCMethod(key, schema.methods[key]) + '\n';

    //Build params type
    if (schema.methods[key].params) {
      types += json2ts.compile(schema.methods[key].params, key.replace(/\./g, '') + 'RpcParams.json') + '\n\n';
    }

    //Build result type
    if (schema.methods[key].result) {
      types += json2ts.compile(schema.methods[key].result, key.replace(/\./g, '') + 'RpcResult.json') + '\n\n';
    }
  });

  Object.keys(schema.definitions).forEach(function(key) {

    types += json2ts.compile(schema.definitions[key], key.replace(/\./g, '') + '.json') + '\n\n';
  });

  return utils.populateTemplate(templates.base, {
    'METHODS': methods,
    'TYPES': types
  });
}

var buildRPCMethod = (method, schema) => {

  var paramsType = '?:undefined';
  if (schema.params) {
    paramsType = ':' + method.replace(/\./g, '') + 'RpcParams'
  }

  var resultType = 'undefined';
  if (schema.result) {
    resultType = method.replace(/\./g, '') + 'RpcResult';
  }

  return utils.populateTemplate(templates.method, {
    'METHOD': method,
    'NAME': method.replace(/\./g, '_'),
    'PARAMS_TYPE': paramsType,
    'RESULT_TYPE': resultType
  });
}
