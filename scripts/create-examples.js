const child_process = require("child_process");
const path = require("path");
const ApiSpecPath = path.join(
  __dirname,
  "..",
  "examples",
  "ExampleAPI.jrgen.json"
);
const jrgenPath = path.join(__dirname, "..", "jrgen.js");
const examplesPath = path.join(__dirname, "..", "examples");

const generatorIds = [
  "docs/html",
  "docs/md",
  "docs/gitbook",
  "test/jasmine",
  "client/es6",
  "client/ts",
  "server/nodejs",
  "spec/postman",
];

for (const generatorId of generatorIds) {
  const outputPath = path.join(examplesPath, generatorId);
  child_process.execSync(
    `node "${jrgenPath}" ${generatorId} -o ${outputPath} ${ApiSpecPath}`
  );
}
