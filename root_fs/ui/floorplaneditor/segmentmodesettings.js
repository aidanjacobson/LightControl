async function populateSegmentModeSettingsOptions() {
    segmentModeSettingsTable.innerHTML = "";
    var currentModes = await apiGet("/getAllSegmentedModes");
    for (var segmentedLightName in floorplan.segmented_led) {
        segmentModeSettingsTable.append(createSegmentedLightModeControllerTR(floorplan.segmented_led[segmentedLightName], segmentedLightName, currentModes[segmentedLightName]));
    }
}

function getModesFromSelects() {
    var selects = document.querySelectorAll("#segmentModeSettingsTable > tr > td > select");
    var modes = {};
    for (var select of selects) {
        var entity_name = select.parentElement.parentElement.getAttribute("entity-name");
        var entity_mode = select.options[select.selectedIndex].value;
        modes[entity_name] = entity_mode;
    }
    return modes;
}

function createSegmentedLightModeControllerTR(segmentedLight, lightName, currentMode) {
    var tr = document.createElement("tr");
    tr.setAttribute("entity-name", lightName);
    var nameTD = document.createElement("td");
    nameTD.innerText = lightName;
    tr.append(nameTD);

    var selectTD = document.createElement("td");
    selectTD.append(createSegmentedLightModeSelector(segmentedLight, currentMode));
    tr.append(selectTD);

    return tr;
}

function createSegmentedLightModeSelector(segmentedLight, currentMode) {
    var select = document.createElement("select");
    select.onchange = segmentedLightModeSelectorOnchangeFunction;
    var setMode = -1;
    for (var i = 0; i < segmentedLight.breakdowns.length; i++) {
        var modeData = segmentedLight.breakdowns[i];
        var option = createSelectOption(modeData.name, modeData.name);
        if (modeData.name == currentMode) {
            setMode = i;
        }
        select.append(option);
    }
    select.append(createSelectOption("one_segment", "one_segment"));
    if (setMode > -1) {
        select.selectedIndex = setMode;
    } else {
        select.selectedIndex = select.options.length-1;
    }
    return select;
}

function createSelectOption(text, value) {
    var option = document.createElement("option");
    option.innerText = text;
    option.value = value;
    return option;
}

function segmentedLightModeSelectorOnchangeFunction(e) {
    renderAllLights();
}

function setAllSegmentPositions() {
    var segmentLights = lightList.filter(lightObj=>lightObj.entity.indexOf("segment.") == 0);
    for (var lightObj of segmentLights) {
        setSegmentPositionFromLightObj(lightObj);
    }
}

function setSegmentPositionFromLightObj(lightObj) {
    var [_, entity, mode] = lightObj.entity.split(".");
    if (mode == "one_segment") return;
    var correspondingMasterLight = floorplan.lights.find(lightObj=>lightObj.entity == entity);
    var lightBulbElement = document.querySelector(`.lightbulb[entity-id='${lightObj.entity}']`);
    var [lightX, lightY] = convertImageCoordsToFloorCoords([lightBulbElement.getStyleLeft(), lightBulbElement.getStyleTop()]);
    var offsetX = lightX - correspondingMasterLight.x;
    var offsetY = lightY - correspondingMasterLight.y;
    
    var segmentedLedInfo = floorplan.segmented_led[entity];
    var groupData = segmentedLedInfo.groups.find(groupInfo=>groupInfo.name == mode);
    groupData.offset = [offsetX, offsetY];
}