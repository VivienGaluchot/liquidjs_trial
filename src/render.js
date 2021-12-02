import liquid from 'liquidjs';
import * as fs from 'fs';
import * as Path from 'path';

// settings

const outputPath = './static';
const inputPath = './src/pages';
const contextPath = './src/context.json';
const components = './src/components';

// utils

function walk(dir, extension) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (extension === undefined || Path.extname(file) === extension) {
            results.push(file);
        }
    });
    return results;
}

// cleanup

for (let filename of walk(outputPath)) {
    fs.unlinkSync(filename);
}

// render

console.log("Check online doc at https://liquidjs.com\n");

const engine = new liquid.Liquid({
    root: [inputPath, components],
    extname: '.liquid'
});

console.log(`>>> Load context ${contextPath}`);
const context = JSON.parse(fs.readFileSync(contextPath));
for (let filename of walk(inputPath, '.liquid')) {
    let template = filename.slice(inputPath.length + 1);
    let outFilename = outputPath + "/" + template.substr(0, template.lastIndexOf(".")) + ".html";;
    console.log(`>>> ${filename} -> ${outFilename}`);
    engine.renderFile(template, context)
        .then((result) => {
            let dir = Path.dirname(outFilename);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(outFilename, result);
        })
        .catch((reason) => {
            console.log(`>>> ${filename} error`);
            console.log(reason);
        });
}