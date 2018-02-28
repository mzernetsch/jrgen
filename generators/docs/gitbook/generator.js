const fs = require("fs");
const path = require("path");
const utils = require(path.join(__dirname, "../../../", "utils.js"));
const markdownGenerator = require("./../md/generator.js");

const templateDir = path.join(__dirname, "templates");
const templates = {
  readme: fs.readFileSync(path.join(templateDir, "README.md"), {
    encoding: "utf8"
  }),
  summary: fs.readFileSync(path.join(templateDir, "SUMMARY.md"), {
    encoding: "utf8"
  })
};

exports.generate = schemas => {
  return new Promise((resolve, reject) => {
    var artifacts = {};

    artifacts["README.md"] = Buffer.from(templates.readme, "utf-8");
    artifacts["SUMMARY.md"] = Buffer.from(buildSummary(schemas), "utf-8");

    var markdownPromises = [];
    schemas.forEach(schema => {
      var markdownPromise = markdownGenerator
        .generate([schema])
        .then(markdownArtifacts => {
          Object.assign(artifacts, markdownArtifacts);
        });

      markdownPromises.push(markdownPromise);
    });

    Promise.all(markdownPromises).then(() => {
      resolve(artifacts);
    });
  });
};

var buildSummary = schemas => {
  let chapters = "";

  schemas.forEach(schema => {
    chapters += "* [" + schema.info.title + "](" + schema.info.title + ".md)\n";
  });

  return utils.populateTemplate(templates.summary, {
    CHAPTERS: chapters
  });
};
