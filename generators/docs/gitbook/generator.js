module.exports.Generator = class Generator {
  constructor() {
    this.fs = require("fs");
    this.path = require("path");
    this.utils = require(this.path.join(__dirname, "../../../", "utils.js"));
    this.markdownGeneratorClass = require("./../md/generator.js").Generator;

    this.templateDir = this.path.join(__dirname, "templates");
    this.templates = this.utils.loadTemplates(this.templateDir);
  }

  generate(schemas) {
    return new Promise((resolve, reject) => {
      var artifacts = {};

      artifacts["README.md"] = Buffer.from(
        this.templates["README.md"],
        "utf-8"
      );
      artifacts["SUMMARY.md"] = Buffer.from(
        this.buildSummary(schemas),
        "utf-8"
      );

      var markdownGenerator = new this.markdownGeneratorClass();

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
  }

  buildSummary(schemas) {
    let chapters = "";

    schemas.forEach(schema => {
      chapters +=
        "* [" + schema.info.title + "](" + schema.info.title + ".md)\n";
    });

    return this.utils.populateTemplate(this.templates["SUMMARY.md"], {
      CHAPTERS: chapters
    });
  }
};
