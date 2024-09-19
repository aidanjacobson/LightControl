window.addEventListener("load", async function() {
    await updateEntityListFromServer();
})

entities = [];

// should only run once at the beginning of application lifecycle.
async function updateEntityListFromServer() {
    entities = await apiGet("/getAllActiveEntities");
    entityList.innerHTML = "";
    for (var entity of entities) {
        entityList.appendChild(createTRFromEntity(entity));
    }
}

function createTRFromEntity(entity) {
    var tr = document.createElement("tr");
    tr.setAttribute("entity-id", entity.entity);
    
    var nameTD = document.createElement("td");
    nameTD.innerHTML = entity.friendlyName;
    tr.appendChild(nameTD);

    var actionTD = document.createElement("td");
    var actionBtn = document.createElement("button");
    actionBtn.innerText = "Lock";
    actionBtn.onclick = lockUnlockClickFunction;
    actionTD.appendChild(actionBtn);
    tr.appendChild(actionTD);

    var colorPreviewTD = document.createElement("td");
    tr.appendChild(colorPreviewTD);

    return tr;
}

async function lockUnlockClickFunction(e) {
    var tr = e.target.parentElement.parentElement;
    var entityID = tr.getAttribute("entity-id");
    if (entityID in lockedColorData) {
        delete lockedColorData[entityID];
    } else {
        await syncColor(entityID);
    }
    syncAllColorsToSavedData();
}

function syncAllColorsToSavedData() {
    for (var tr of entityList.children) {
        var entityID = tr.getAttribute("entity-id");
        if (entityID in lockedColorData) {
            tr.children[1].children[0].innerText = "Unlock";
            var previewTD = tr.children[2];
            previewTD.innerText = lockedColorData[entityID];
            previewTD.style.backgroundColor = lockedColorData[entityID];
        } else {
            tr.children[1].children[0].innerText = "Lock";
            var previewTD = tr.children[2];
            previewTD.innerText = "";
            previewTD.style.backgroundColor = "";
        }
    }
    var numLocked = Object.keys(lockedColorData).length;
    var numTotal = entities.length;
    progressCompleted.value = numLocked/numTotal*100;
    progressDisplay.innerText = Math.round(progressCompleted.value);
}

var lockedColorData = {};
async function syncColor(entityID) {
    var lightColor = await apiGet(`/getLightEntityColor/${entityID}`);
    lockedColorData[entityID] = lightColor;
}

function buildAreaBuilder() {
    var areaBuilderComponents = [];
    for (entityName in lockedColorData) {
        areaBuilderComponents.push({
            lights: entityName,
            color: lockedColorData[entityName]
        })
    }
    var defaultColor = getDefaultColor();
    var areaBuilderCommand = `eval(new AreaBuilder(${JSON.stringify(areaBuilderComponents)}, ${JSON.stringify(defaultColor)}))`;
    return areaBuilderCommand;
}

function getDefaultColor() {
    var defaultColor = colorInput.value;
    if (!defaultColor || defaultColor == "") defaultColor = "donotchange";
    return defaultColor;
}

async function doSetAll() {
    var setAllCommand;
    if (Object.keys(lockedColorData).length == 0) { // nothing is set yet
        setAllCommand = getDefaultColor();
    } else {
        setAllCommand = buildAreaBuilder();
    }
    await setAll(setAllCommand);
}

async function browseForColor() {
    var newColor = await selectColor();
    colorInput.value = newColor;
}

async function copyAreaBuilderCommand() {
    var command = buildAreaBuilder();
    navigator.clipboard.writeText(command);
}

async function copyColorMapping() {
    var colorMapping = {};
    for (entityID in lockedColorData) {
        colorMapping[entityID] = lockedColorData[entityID];
    }
    var command = JSON.stringify(colorMapping);
    navigator.clipboard.writeText(command);
}

function clearFilter() {
    filterInput.value = "";
    updateFilter();
}

function updateFilter() {
    var filtered = getFilteredEntities(filterInput.value);
    for (var entityTR of entityList.children) {
        if (filtered.find(entityInfo=>entityInfo.entity == entityTR.getAttribute("entity-id"))) {
            entityTR.show();
        } else {
            entityTR.hide();
        }
    }
}

setInterval(updateFilter, 500);

function getFilteredEntities(textFilter) {
    return entities.filter(function(entityInfo) {
        if (textFilter == "") return true;
        var lowercaseID = entityInfo.entity.toLowerCase();
        var lowercaseName = entityInfo.friendlyName.toLowerCase();
        var lowercaseFilter = textFilter.toLowerCase();
        return lowercaseID.includes(lowercaseFilter) || lowercaseName.includes(lowercaseFilter);
    })
}

function loadAreaBuilderFromPrompt() {
    var string = prompt("Enter AreaBuilder String")
    var matchRE = /^eval\(new AreaBuilder\((.+), "(.+)"\)\)$/;
    if (!matchRE.test(string)) {
        consolelog("Did not find valid AreaBuilder String");
        return;
    }
    var [_, jsonString, defaultColor] = matchRE.exec(string);
    colorInput.value = defaultColor;
    var lightData = JSON.parse(jsonString);
    lockedColorData = {};
    for (var {lights, color} of lightData) {
        lockedColorData[lights] = color;
    }
    syncAllColorsToSavedData();
}

function loadColorMappingFromPrompt() {
    var string = prompt("Enter ColorMapping String").replaceAll("\\", "");
    var colorMapping = JSON.parse(string);
    lockedColorData = {};
    for (var colorName in colorMapping) {
        var colorData = colorMapping[colorName];
        lockedColorData[colorName] = colorData;
    }
    syncAllColorsToSavedData();
}