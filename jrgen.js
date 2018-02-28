#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const program = require("commander");
const version = require("./package.json").version;
const utils = require(path.join(__dirname, "utils.js"));

program
  .version(version)
  .option(
    "-o, --outdir <path>",
    "Output directory. Defaults to current working directory."
  );

const generators = utils.findGenerators();

Object.keys(generators).forEach(key => {
  program.command(key + " <specFiles...>").action((specFiles, cmd) => {
    var outdir = path.normalize(program.outdir || process.cwd());
    if (!fs.existsSync(outdir)) {
      console.error("Specified outdir '%s' is not available.", outdir);
      return;
    }

    var specs = utils.loadSchemas(specFiles);
    if (specs.length === 0) {
      console.error("No specFiles specified.");
      return;
    }

    var generator = require(generators[key]);
    if (!generator) {
      console.error("Cant load generator '%s.", key);
      return;
    }

    generator.generate(specs).then(artifacts => {
      utils.prettifyArtifacts(artifacts);
      utils.writeArtifacts(artifacts, outdir);
    });
  });
});

program.parse(process.argv);
