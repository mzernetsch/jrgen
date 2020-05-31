const fs = require("fs-extra");
const glob = require("glob");

const filePathsToDelete = glob.sync(
  __dirname + "/../examples/**/!(ExampleAPI.jrgen.json)"
);

for (const filePath of filePathsToDelete) {
  fs.removeSync(filePath);
}
