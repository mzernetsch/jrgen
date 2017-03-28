const fs = require('fs');
const path = require('path');
const markdowntable = require('markdown-table');
const utils = require(path.join(__dirname, "../../../", 'utils.js'));

const templateDir = path.join(__dirname, 'templates');
const templates = {
    'base': fs.readFileSync(path.join(templateDir, 'base.md'), {
        encoding: 'utf8'
    }),
    'method': fs.readFileSync(path.join(templateDir, 'method.md'), {
        encoding: 'utf8'
    })
};

exports.generate = (schema, outdir) => {

    //Build documentation
    var doc = buildDocumentation(schema);

    //Write out doc file
    fs.writeFileSync(path.join(outdir, schema.info.title + '.md'), doc);
}

var buildDocumentation = (schema) => {

    //Build docs
    return utils.populateTemplate(templates.base, {
        'TITLE': schema.info.title,
        'DESCRIPTION': schema.info.description,
        'VERSION': schema.info.version,
        'API': buildMethodsDocumentation(schema.methods),
        'TOC': buildToc(schema.methods)
    });
}

var buildMethodsDocumentation = (methodsSchema) => {

    if (!methodsSchema) {
        return '';
    }

    var methodsDocumentation = '';

    for (var methodName in methodsSchema) {

        var methodSchema = methodsSchema[methodName];

        //Build method block
        methodsDocumentation += utils.populateTemplate(templates.method, {
            'METHOD': methodName,
            'SUMMARY': methodSchema.summary,
            'EXAMPLE_REQUEST': utils.generateRequestExample(methodName, methodSchema.params),
            'EXAMPLE_RESPONSE': utils.generateResponseExample(methodSchema.result),
            'DESCRIPTION': buildDescriptionSection(methodSchema.description),
            'PARAMETERS': buildParamsSection(methodSchema.params),
            'RESULT': buildResultSection(methodSchema.result),
            'ERRORS': buildErrorsSection(methodSchema.errors)
        }) + '\n';
    }

    return methodsDocumentation;
}

var buildDescriptionSection = (descripton) => {

    if (!descripton) {
        return '';
    }

	return '### Description\n' + descripton + '\n\n';
}

var buildParamsSection = (paramsSchema) => {

    if (!paramsSchema) {
        return '';
    }

    var paramsPropertyList = [];
    parsePropertyList('params', paramsSchema).forEach(function(item) {
		paramsPropertyList.push([
			item.name,
			item.type,
			item.description
		]);
    });

    return '### Parameters\n' + markdowntable([
        ['Name', 'Type', 'Description']
    ].concat(paramsPropertyList)) + '\n\n';
}

var buildResultSection = (resultSchema) => {

    if (!resultSchema) {
        return '';
    }

	var resultPropertyList = [];
	parsePropertyList('result', resultSchema).forEach(function(item) {
		resultPropertyList.push([
			item.name,
			item.type,
			item.description
		]);
	});

	return '### Result\n' + markdowntable([
        ['Name', 'Type', 'Description']
    ].concat(resultPropertyList)) + '\n\n';
}

var buildErrorsSection = (errorsSchema) => {

    if (!errorsSchema || !errorsSchema.length) {
        return '';
    }

	var errorsPropertyList = [];
	errorsSchema.forEach(function(item) {
		errorsPropertyList.push([
			item.code,
			item.message,
			item.description
		]);
    });

	return '### Errors\n' + markdowntable([
		['Code', 'Message', 'Description']
	].concat(errorsPropertyList)) + '\n\n';
}

var parsePropertyList = (name, schema) => {

    if (!schema) {
        return [];
    }

    var entries = [];

    entries.push({
        "name": name,
        "type": schema.type,
        "description": schema.description || ''
    });

    if (schema.type === "array") {
        entries = entries.concat(parsePropertyList(name + '.[#]', schema.items));
    } else if (schema.type === "object") {
        Object.keys(schema.properties).forEach(function(key) {
            entries = entries.concat(parsePropertyList(name + '.' + key, schema.properties[key]));
        });
    }

    return entries;
}

var buildToc = (methodsSchema) => {

    var toc = '';

    for (var methodName in methodsSchema) {
        toc += '* [' + methodName + '](#' + methodName + ')\n';
    }

    return toc;
}
