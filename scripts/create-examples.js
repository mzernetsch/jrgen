const child_process = require("child_process");
const path = require("path");
const ApiSpecPath = path.join(
  __dirname,
  "..",
  "examples",
  "ExampleAPI.jrgen.json"
);
const jrgenPath = path.join(__dirname, "..", "src", "jrgen.js");
const examplesPath = path.join(__dirname, "..", "examples");

const blueprintIds = [
  "docs-html",
  "docs-md",
  "client-web-js",
  "client-web-ts",
  "server-nodejs-js",
  "spec-postman",
];

for (const generatorId of blueprintIds) {
  const outputPath = path.join(examplesPath, generatorId.replace(/-/g, "/"));
  child_process.execSync(
    `node "${jrgenPath}" ${generatorId} -o ${outputPath} ${ApiSpecPath}`
  );
}
