#!/usr/bin/env node

var version = require("./package.json").version;
var program = require("commander");
program
  .version(version)
  .command("docs", "Generate docs")
  .alias("d")
  .command("test", "Generate tests")
  .alias("t")
  .command("client", "Generate client")
  .alias("c")
  .command("server", "Generate server")
  .alias("s")
  .parse(process.argv);
