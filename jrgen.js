#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const program = require("commander");
const version = require("./package.json").version;
const utils = require(path.join(__dirname, "utils.js"));

program
  .version(version)
  .option(
    "-o, --outdir <path>",
    "Output directory. Defaults to current working directory."
  )
  .on("--help", () => {
    console.log("");
    console.log("");
    console.log("  Examples:");
    console.log("");
    console.log("    Create html documentation from 'API.schema.json':");
    console.log("    $ jrgen docs/html ~/API.schema.json");
    console.log("");
    console.log("    Create a postman test collection from 'API.schema.json':");
    console.log("    $ jrgen test/postman ~/API.schema.json");
    console.log("");
    console.log(
      "    Create a ts client from 'API.schema.json' and write all generated files into the ./client subdirectory:"
    );
    console.log("    $ jrgen client/ts -o ./client ~/API.schema.json");
    console.log("");
    console.log(
      "    Create a nodejs server from a combination of 'API1.schema.json' and 'API2.schema.json':"
    );
    console.log(
      "    $ jrgen server/nodejs ~/API1.schema.json ~/API2.schema.json"
    );
    console.log("");
    console.log("");
  });

const generators = utils.findGenerators();

Object.keys(generators).forEach((key) => {
  program.command(key + " <specFiles...>").action((specFiles, cmd) => {
    var outdir = path.normalize(program.outdir || process.cwd());
    fs.ensureDirSync(outdir);

    var specs = utils.loadSchemas(specFiles);
    if (specs.length === 0) {
      console.error("No specFiles specified.");
      return;
    }

    var Generator = require(generators[key]).Generator;
    if (!Generator) {
      console.error("Cant load generator class '%s.", key);
      return;
    }

    const generator = new Generator();
    generator.generate(specs).then((artifacts) => {
      utils.prettifyArtifacts(artifacts);
      utils.writeArtifacts(artifacts, outdir);
    });
  });
});

program.parse(process.argv);
