#!/usr/bin/env node
const path = require("path");
const { program } = require("commander");
const version = require("../package.json").version;
const utils = require(path.join(__dirname, "utils.js"));

program.version(version).on("--help", () => {
  console.log("");
  console.log("");
  console.log("  Examples:");
  console.log("");
  console.log("    Create html documentation from 'API.jrgen.json':");
  console.log("    $ jrgen docs-html ~/API.jrgen.json");
  console.log("");
  console.log("    Create a postman specification from 'API.jrgen.json':");
  console.log("    $ jrgen spec-postman ~/API.jrgen.json");
  console.log("");
  console.log(
    "    Create a ts web client from 'API.jrgen.json' and write all generated files into the ./client subdirectory:"
  );
  console.log("    $ jrgen client-web-ts -o ./client ~/API.jrgen.json");
  console.log("");
  console.log("");
});

const blueprints = utils.gatherBlueprints();

Object.keys(blueprints).forEach((key) => {
  program
    .command(key)
    .argument("<specFilePath>")
    .option(
      "-o, --outdir <path>",
      "Output directory. Defaults to current working directory."
    )
    .action(async (schemaFile, options) => {
      const schema = await utils.loadSchema(schemaFile);
      if (!schema) {
        console.error("No spec file provided.");
        return;
      }

      const blueprint = await require(blueprints[key])(schema);

      const artifacts = utils.buildArtifacts(blueprint);

      utils.prettifyFileTree(artifacts);

      utils.saveFileTreeTo(artifacts, options.outdir);
    });
});

program.parse(process.argv);
