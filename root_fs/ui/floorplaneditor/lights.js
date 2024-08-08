function renderAllLights() {
    lights.innerHTML = "";
    for (var lightObj of floorplan.lights) {
        if (typeof lightObj.hidden !== "undefined" && lightObj.hidden) continue;
        lights.append(createLightElement(lightObj));
    }
}

function createLightElement(lightObject) {
    var lightDiv = document.createElement("div");
    lightDiv.classList.add("lightbulb");
    var lightBulbImage = document.createElement("img");
    lightBulbImage.src = "light-bulb.svg";
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
        light.classList.remove("selected");
    }
    lightElement.classList.add("selected");
    selectedEditorContainer.show();
    renderSelectedEditor();
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
    dragging = false;
    clicking = false;
    saveFloorplan();
}

function lightMouseMoveFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!clicking) return;
    var currentMouseCoords = [e.clientX, e.clientY];
    if (dist(currentMouseCoords, initalClickCoords) > 10) {
        dragging = true;
    }
    if (dragging) {
        var newX = currentMouseCoords[0] - initalClickCoords[0] + initialElementCoords[0];
        var newY = currentMouseCoords[1] - initalClickCoords[1] + initialElementCoords[1];
        selectedLight.style.left = newX;
        selectedLight.style.top = newY;
    }
}

window.addEventListener("mouseup", lightMouseUpFunction);
window.addEventListener("mousemove", lightMouseMoveFunction);

function renderSelectedEditor() {
    entityNameDisplay.innerText = selectedLight.getAttribute("entity-id");
    var lightObject = floorplan.lights.find(light=>light.entity==selectedLight.getAttribute("entity-id"));
    if (typeof lightObject.friendlyName !== "undefined") {
        entityNameDisplay.innerText = lightObject.friendlyName;
    }
}

async function saveFloorplan() {
    for (var light of floorplan.lights) {
        if (typeof light.hidden !== "undefined" && light.hidden) continue;
        var imageCoords = getImageCoordsFromEntityID(light.entity);
        var floorCoords = convertImageCoordsToFloorCoords(imageCoords);
        [light.x, light.y] = floorCoords;
    }
    return await setFloorplan(floorplan);
}

function getImageCoordsFromEntityID(id) {
    var lightElement = document.querySelector(`.lightbulb[entity-id='${id}']`);
    if (!lightElement) console.error("no light", id);
    return [lightElement.getStyleLeft(), lightElement.getStyleTop()];
}

function selectEntity(id) {
    var lightElement = document.querySelector(`.lightbulb[entity-id='${id}']`);
    if (!lightElement) console.error("no light", id);
    setSelectedLight(lightElement)
}