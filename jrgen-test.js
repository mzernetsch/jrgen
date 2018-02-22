var fs = require("fs");
var path = require("path");
var program = require("commander");
var utils = require(path.join(__dirname, "utils.js"));

//Parse args
program
  .usage("[options] <schema ...>")
  .option("-f, --format <format>", 'Output format. Defaults to "jasmine".')
  .option(
    "-o, --outdir <directory>",
    "Output directory. Defaults to current working directory."
  )
  .parse(process.argv);

//Check outdir
var outdir = path.normalize(program.outdir || process.cwd());
if (!fs.existsSync(outdir)) {
  console.log("Specified outdir '%s' is not available.", outdir);
  return;
}

//Check generator
var generatorPath = path.join(
  __dirname,
  "generators",
  "test",
  program.format || "jasmine",
  "generator.js"
);
if (!fs.existsSync(generatorPath)) {
  console.log("Specified format '%s' is not available.", program.format);
  return;
}

//Load generator
var generator = require(generatorPath);
if (!generator) {
  console.log("Cant load generator for format '%s'.", program.format);
  return;
}

//Load all schemas
var schemas = utils.loadSchemas(program.args);
if (schemas.length === 0) {
  console.error("No schema specified.");
  return;
}

//Generate docs
generator.generate(schemas).then(artifacts => {
  utils.prettifyArtifacts(artifacts);
  utils.writeArtifacts(artifacts, outdir);
});
