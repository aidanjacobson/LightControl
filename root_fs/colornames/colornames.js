var ConfigLoader = require("../node_configloader");
var options = {
    store: "colornames"
}
var server = new ConfigLoader(options);

var colors;

async function loadColors() {
    colors = await server.downloadConfig();
    return colors;
}

function getColors() {
    return colors;
}

async function saveCustomColors(customColors) {
    server.config = customColors;
    await server.uploadConfig();
}

loadColors();

module.exports = {getColors, saveCustomColors, loadColors};