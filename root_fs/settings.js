const ConfigLoader = require("./node_configloader")

const configOptions = {
    securityKey: process.env.config_access_key,
    store: "segment_modes"
}

var settingsLoader = new ConfigLoader(configOptions);
(async function() {
    await settingsLoader.downloadConfig();
})()

const getSetting = async function(settingName) {
    await settingsLoader.downloadConfig();
    var fieldParts = settingName.split(".");
    var currentScope = settingsLoader.config;
    for (var i = 0; i < fieldParts.length; i++) {
        var currentField = fieldParts[i];
        if (currentField.indexOf("[") == -1) {
            currentScope = currentScope[currentField];
        } else {
            var fieldName = currentField.substring(0, currentField.indexOf("["));
            var indexPart = currentField.substring(currentField.indexOf("[")+1, currentField.length-1);
            var index = eval(indexPart);
            currentScope = currentScope[fieldName][index];
        }
    }
    return currentScope;
}

const setSetting = async function(settingName, value) {
    await settingsLoader.downloadConfig();
    var fieldParts = settingName.split(".");
    var currentScope = settingsLoader.config;
    for (var i = 0; i < fieldParts.length - 1; i++) {
        var currentField = fieldParts[i];
        if (currentField.indexOf("[") == -1) {
            currentScope = currentScope[currentField];
        } else {
            var fieldName = currentField.substring(0, currentField.indexOf("["));
            var indexPart = currentField.substring(currentField.indexOf("[")+1, currentField.length-1);
            var index = eval(indexPart);
            currentScope = currentScope[fieldName][index];
        }
    }
    var currentField = fieldParts[fieldParts.length-1];
    if (currentField.indexOf("[") == -1) {
        currentScope[currentField] = value;
    } else {
        var fieldName = currentField.substring(0, currentField.indexOf("["));
        var indexPart = currentField.substring(currentField.indexOf("[")+1, currentField.length-1);
        var index = eval(indexPart);
        currentScope[fieldName][index] = value;
    }
    await settingsLoader.uploadConfig();
}

module.exports = {setSetting, getSetting};