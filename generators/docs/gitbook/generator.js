const fs = require('fs');
const path = require('path');
const utils = require(path.join(__dirname, "../../../", 'utils.js'));
const markdownGenerator = require('./../md/generator.js');

const templateDir = path.join(__dirname, 'templates');
const templates = {
    'readme': fs.readFileSync(path.join(templateDir, 'README.md'), {
        encoding: 'utf8'
    }),
    'summary': fs.readFileSync(path.join(templateDir, 'SUMMARY.md'), {
        encoding: 'utf8'
    })
};

exports.generate = (schemas, outdir) => {

    schemas.forEach((schema) => {
        markdownGenerator.generate([schema], outdir);
    });

    fs.writeFileSync(path.join(outdir, 'README.md'), templates.readme);
    fs.writeFileSync(path.join(outdir, 'SUMMARY.md'), buildSummary(schemas));
}

var buildSummary = (schemas) => {
    let chapters = '';

    schemas.forEach((schema) => {
        chapters += '* [' + schema.info.title + '](' + schema.info.title + '.md)\n';
    });

    //Build summary
    return utils.populateTemplate(templates.summary, {
        'CHAPTERS': chapters
    });
}