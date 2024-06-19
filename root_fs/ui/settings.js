// var alwaysBrowseColor = true;
var dontGoBack = true;
//var renderColorBrowsePreview = false;
var locationDebug = true;

var settingsOptions = {
    useScene: {
        type: "toggle",
        name: "Use Home Assistant Scene Rendering",
        default: false,
    },
    useNormalDistribution: {
        type: "toggle",
        name: "Use Normal Distribution for Color Theme",
        default: true,
    },
    alwaysBrowseColor: {
        type: "toggle",
        name: "Always Browse Color",
        default: true
    },
    renderBrowseColorPreview: {
        type: "toggle",
        name: "Render Browse Color Preview",
        default: false
    },
    useLocalhostSegmentData: {
        type: "toggle",
        name: "Use Localhost Segment Data",
        default: true
    }
};

class SavedSettings {
    settingNames = [];
    name = "";
    constructor(settingsOptions, name="") {

        if (SavedSettings.instance) {
            Object.assign(this, SavedSettings.instance);
            return;
        }

        this.settingsOptions = JSON.parse(JSON.stringify(settingsOptions));
        this.name = name;
        // this.settings = this.readFromLocalStorage();
        var lsSettings = this.readFromLocalStorage();
        Object.assign(this, lsSettings);
        //this.settingNames = Object.keys(lsSettings);
        var keys = Object.keys(this.settingsOptions);
        for (var i = 0; i < keys.length; i++) {
            var settingName = keys[i];
            if (!(settingName in this) && typeof this.settingsOptions[settingName].default !== "undefined") {
                this[settingName] = this.settingsOptions[settingName].default;
            }
            this.settingNames.push(settingName);
        }
        // this.save();
        // SavedSettings.setInstance(this);
    }

    getSettingInfo(name) {
        return this.settingsOptions[name];
    }

    readFromLocalStorage() {
        var settingsString = localStorage.getItem(this.name + "settings");
        if (!settingsString) settingsString = "{}";
        try {
            var settingsObject = JSON.parse(settingsString);
        } catch(e) {
            var settingsObject = {};
        }
        return settingsObject;
    }

    save() {
        var saveObj = {};
        for (var setting of this.settingNames) {
            saveObj[setting] = this[setting];
        }
        // console.log(this.settingNames, saveObj);
        
        var saveString = JSON.stringify(saveObj);
        localStorage.setItem(this.name + "settings", saveString);
    }

    static intsance = null;
    static setInstance(_instance) {
        SavedSettings.instance = _instance;
    }
}

// var settings = new SavedSettings(settingsOptions);
var settings = new SavedSettings(settingsOptions);
window.addEventListener("load", async function() {
    var segmentedLights = await apiGet("/getSegmentedLights");
    //console.log(segmentedLights);
    for (var i = 0; i < segmentedLights.length; i++) {
        var modes = await apiGet("/getAvailableStripModes/" + segmentedLights[i]);
        var settingsOption = {
            type: "selection",
            name: `${segmentedLights[i]} mode`,
            options: modes
        }
        settingsOptions[`mode_${segmentedLights[i]}`] = settingsOption;
    }
    settings = new SavedSettings(settingsOptions);
    settings.save()

    segmentedLights.forEach(function(lightName) {
        apiGet(`/setSegmentedMode/${lightName}/${settings[`mode_${lightName}`]}`);
    })
})

function settingsClick() {
    switchToMenu(settingsmenu)
    renderSettingsBox();
}

function renderSettingsBox() {
    settingsContainer.innerHTML = "";
    for (var name of settings.settingNames) {
        settingsContainer.append(createSettingBlock(name));
    }
}

function createSettingBlock(name) {
    var mainblock = element("div", "settingsBlock");
    var options = settings.settingsOptions[name];
    // console.log(options);

    if (options.type == "toggle") {
        var label = element("label").setText(options.name);
        label.setAttribute("for", "setting_" + name);
        mainblock.append(label);
        var input = element("input", "settingsCheckbox");
        input.type = "checkbox";
        if (settings[name]) {
            input.checked = true;
        }
        input.setAttribute("setting-name", name);
        input.setAttribute("id", "setting_" + name);
        input.addEventListener("click", createSettingsOnclickFunction(input));
        mainblock.append(input);
    } else if (options.type == "selection") {
        var label = element("label").setText(options.name);
        label.setAttribute("for", "setting_" + name);
        mainblock.append(label);
        var select = element("select", "settingsSelect");
        var selectOptions = options.options;
        selectOptions.map(option=>element("option").setText(option).setValue(option)).forEach(option=>select.append(option));
        if (typeof settings[name] !== "undefined" && selectOptions.indexOf(settings[name]) > -1) {
            select.selectedIndex = selectOptions.indexOf(settings[name]);
        }
        select.setAttribute("setting-name", name);
        select.setAttribute("id", "setting_" + name);
        select.addEventListener("change", createSettingsSelectOnchangeFunction(select))
        mainblock.append(select);
    }

    return mainblock;
}

function createSettingsOnclickFunction(element) {
    return function() {
        var name = element.getAttribute("setting-name");
        var value = element.checked;
        settings[name] = value;
        settings.save();
    }
}

function createSettingsSelectOnchangeFunction(element) {
    return function() {
        var name = element.getAttribute("setting-name");
        var value = element.options[element.selectedIndex].value;
        settings[name] = value;
        settings.save();
        var lightName = name.substring(5, name.length);
        apiGet(`/setSegmentedMode/${lightName}/${value}`);
    }
}

function element(name, ...classes) {
    var element = document.createElement(name);
    if (classes.length > 0) element.classList.add(...classes);
    return element;
}

HTMLElement.prototype.setText = function(text) {
    this.innerText = text;
    return this;
}

HTMLOptionElement.prototype.setValue = function(value) {
    this.value = value;
    return this;
}

HTMLElement.prototype.setHTML = function(html) {
    this.innerHTML = html;
    return this;
}