var light = require("./lightcommand/light");
var customColorsLoader = require("./colornames/colornames"), customColors = {};

async function saveColor(color, nameInput) {
    if (nameInput == null) return;
    await customColorsLoader.loadColors();
    customColors = customColorsLoader.getColors();
    var name = nameInput.toLowerCase().replace(/ /g, "").replace(/_/g, "");
    customColors[name] = color;
    await customColorsLoader.saveCustomColors(customColors);
}

async function saveColorScene(nameInput, nocache=false) {
    customColors = await customColorsLoader.getColors();
    var name = nameInput.toLowerCase().replace(/ /g, "").replace(/_/g, "");
    customColors[name] = await light.generateSaveColorsString(nocache);
    await customColorsLoader.saveCustomColors(customColors);
}

module.exports = {saveColor, saveColorScene};