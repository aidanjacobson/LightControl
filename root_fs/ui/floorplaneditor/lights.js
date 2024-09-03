var lightList = [];
var lastLightColors = {};
function setLastLightColors(newLastLightColors) {
    // Object.assign(lastLightColors, newLastLightColors);
    for (var prop in newLastLightColors) {
        var propValue = newLastLightColors[prop];
        if (prop.indexOf("light.") == 0) {
            prop = prop.replace("light.", "");
        }
        lastLightColors[prop] = propValue;
    }
}
async function renderAllLights() {
    lightList = await apiPost("/expandLightListWithModes", {lightList: floorplan.lights.map(l=>l.entity), modes: getModesFromSelects()})
    lights.innerHTML = "";
    for (var lightObj of lightList) {
        if (typeof lightObj.hidden !== "undefined" && lightObj.hidden) continue;
        lights.append(createLightElement(lightObj));
    }
}

async function updateLightCachedColors() {
    var lightColorsData = await apiGet("/getLastLightData");
    setLastLightColors(lightColorsData.cachedColors);
}

function updateLightElementColors() {
    setSelectedLight(selectedLight);
}

setInterval(refreshLights, 7000);

async function refreshLights() {
    await updateLightCachedColors();
    await setPageLightColors();
}

var trueColor = true;

async function setPageLightColors() {
    for (var lightbulbElement of document.querySelectorAll(".lightbulb")) {
        var img = lightbulbElement.children[0];
        if (!trueColor) {
            img.style.backgroundColor = "rgb(37, 214, 37)";
            continue;
        }
        var img = lightbulbElement.children[0];
        var colorObj = lastLightColors[lightbulbElement.getAttribute("entity-id")];
        var color = "rgba(0, 0, 0, 0)";
        if (colorObj) {
            // color = `rgb(${Math.round(colorObj.r)}, ${Math.round(colorObj.g)}, ${Math.round(colorObj.b)})`;
            color = colorObj;
        }
        img.style.backgroundColor = color;
    }
    setSelectedLight(selectedLight);
}

function createLightElement(lightObject) {
    var lightDiv = document.createElement("div");
    lightDiv.classList.add("lightbulb");
    var lightBulbImage = document.createElement("img");
    lightBulbImage.src = "media/light-bulb.svg";
    lightDiv.append(lightBulbImage);

    lightDiv.setAttribute("draggable", true);

    lightDiv.setAttribute("entity-id", lightObject.entity);
    [lightDiv.style.left, lightDiv.style.top] = convertFloorCoordsToImageCoords([lightObject.x, lightObject.y])

    lightDiv.addEventListener("mousedown", lightMouseDownFunction);
    lightDiv.addEventListener("mouseup", lightMouseUpFunction);
    lightDiv.addEventListener("mousemove", lightMouseMoveFunction);

    return lightDiv;
}

var selectedLight;
function setSelectedLight(lightElement) {
    selectedLight = lightElement;
    var allLights = document.querySelectorAll(".lightbulb");
    for (var light of allLights) {
        var lightColor = getComputedStyle(light.children[0]).backgroundColor;
        if (lightColor == "rgba(0, 0, 0, 0)") lightColor = "white";
        if (light == lightElement) {
            light.classList.add("selected");
            light.children[0].style.boxShadow = `0px 0px ${maxShadow}px ${maxShadow}px ${lightColor}`;
            renderSelectedEditor();
        } else {
            light.classList.remove("selected");
            var shadowPercent = Math.pow(1 - (opacityRange.valueAsNumber/100), 4);
            var maxShadow = 30;
            var shadowLength = maxShadow * shadowPercent;
            if (!trueColor || lastBackgroundCSS != "black") shadowLength = 0;
            light.children[0].style.boxShadow = `0px 0px ${shadowLength}px ${shadowLength}px ${lightColor}`;
        }
    }
    selectedEditorContainer.show();
}

var dragging = false;
var clicking = false;
var initalClickCoords = [0, 0];
var initialElementCoords = [0, 0];
function lightMouseDownFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    clicking = true;
    if (e.currentTarget != selectedLight) {
        setSelectedLight(e.currentTarget);
    }
    initalClickCoords = [e.clientX, e.clientY];
    initialElementCoords = [selectedLight.getStyleLeft(), selectedLight.getStyleTop()];
}

function lightMouseUpFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    var wasDragging = dragging;
    dragging = false;
    clicking = false;
    if (wasDragging) {
        saveFloorplan();
        if (colorSetInput.value != "" && trueColor) {
            doSetAll();
        }
    }
}

function lightMouseMoveFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!clicking) return;
    var currentMouseCoords = [e.clientX, e.clientY];
    if (!dragging && dist(currentMouseCoords, initalClickCoords) > 10) {
        dragging = true;
    }
    if (dragging) {
        var newX = currentMouseCoords[0] - initalClickCoords[0] + initialElementCoords[0];
        var newY = currentMouseCoords[1] - initalClickCoords[1] + initialElementCoords[1];
        selectedLight.style.left = newX;
        selectedLight.style.top = newY;
    }
}

// window.addEventListener("mouseup", lightMouseUpFunction);
window.addEventListener("load", function() {
    opacityRange.addEventListener("mousemove", opacityMouseMove);
    opacityRange.addEventListener("mousedown", stopPropagation);
    opacityRange.addEventListener("mouseup", stopPropagation);
    window.addEventListener("mousemove", lightMouseMoveFunction);
})

function opacityMouseMove(e) {
    e.stopPropagation();
    mapImg.style.opacity = `${opacityRange.value}%`;
    setSelectedLight(selectedLight);
}

function stopPropagation(e) {
    e.stopPropagation();
}

function renderSelectedEditor() {
    entityNameDisplay.innerText = selectedLight.getAttribute("entity-id");
    var lightObject = lightList.find(light=>light.entity==selectedLight.getAttribute("entity-id"));
    if (typeof lightObject.friendlyName !== "undefined") {
        entityNameDisplay.innerText = lightObject.friendlyName;
    }
}

async function saveFloorplan() {
    for (var light of floorplan.lights) {
        if (typeof light.hidden !== "undefined" && light.hidden) continue;
        var imageCoords = getImageCoordsFromEntityID(light.entity);
        if (imageCoords == null) continue;
        var floorCoords = convertImageCoordsToFloorCoords(imageCoords);
        [light.x, light.y] = floorCoords;
    }
    setAllSegmentPositions();
    var output = await setFloorplan(floorplan);

    return output;
}

function getImageCoordsFromEntityID(id) {
    var lightElement = document.querySelector(`.lightbulb[entity-id='${id}']`);
    if (!lightElement) {
        // console.error("no light", id);
        return null;
    }
    return [lightElement.getStyleLeft(), lightElement.getStyleTop()];
}

function selectEntity(id) {
    var lightElement = document.querySelector(`.lightbulb[entity-id='${id}']`);
    if (!lightElement) console.error("no light", id);
    setSelectedLight(lightElement)
}