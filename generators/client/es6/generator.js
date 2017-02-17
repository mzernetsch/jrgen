const fs = require('fs');
const path = require('path');
const utils = require(path.join(__dirname, "../../../", 'utils.js'));

const templateDir = path.join(__dirname, 'templates');
const templates = {
	'base': fs.readFileSync(path.join(templateDir, 'base.js'), { encoding: 'utf8' }),
	'method': fs.readFileSync(path.join(templateDir, 'method.js'), { encoding: 'utf8' })
};

exports.generate = (schema, outdir) => {

	fs.writeFileSync(path.join(outdir, schema.info.title + 'Client.js'), buildClient(schema));
}

var buildClient = (schema) => {

	var methods = '';
	Object.keys(schema.methods).forEach(function(key) {
		methods += utils.populateTemplate(templates.method, {
			'METHOD':key,
			'METHOD_NAME':key.replace(/\./g, '_'),
		});
	});

	return utils.populateTemplate(templates.base, {
		'CONTENT':methods
	});
}
