var fs = require('fs');
var path = require('path');
var program = require('commander');
var merge = require('deepmerge');

//Parse args
program
	.usage('[options] <schema ...>')
    .option('-f, --format <format>', 'Output format. Defaults to "html".')
	.option('-o, --outdir <directory>', 'Output directory. Defaults to current working directory.')
    .parse(process.argv);

//Check outdir
var outdir = path.normalize(program.outdir || process.cwd());
if(!fs.existsSync(outdir)){
	console.log("Specified outdir '%s' is not available.", outdir);
	return;
}

//Check generator
var generatorPath = path.join(__dirname, 'generators', 'docs', program.format || 'html', 'generator.js');
if(!fs.existsSync(generatorPath)){
	console.log("Specified format '%s' is not available.", program.format);
	return;
}

//Load generator
var generator = require(generatorPath);
if(!generator){
	console.log("Cant load generator for format '%s'.", program.format);
	return;
}

//Load all schemas
var apiSchema = {};
program.args.forEach((schemaPath, index) => {

	//Load schema
	var schema = require(schemaPath);
	if(!schema){
		console.log("Specified schema '%s' does not exist. Skipping.");
		return;
	}

	apiSchema = merge(apiSchema, schema);
});

//Generate docs
generator.generate(apiSchema, outdir);
