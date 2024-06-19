const fs = require("fs");
const path = require("path");

const externalDir = "./externalfiles";
function getExternalFiles() {
    var files = fs.readdirSync(path.resolve(__dirname, externalDir));
    var outColors = {};
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = path.join(__dirname, externalDir, file);
        if (file.indexOf(".json") == -1) {
            console.log(`skipping external file ${file} because it is not .json format`);
            continue;
        }
        colors = require(`./externalfiles/${file}`);
        Object.keys(colors).forEach(colorKey=>outColors[colorKey]=colors[colorKey]);
    }
    return outColors;
}

module.exports = getExternalFiles();