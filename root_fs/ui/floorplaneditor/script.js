var mapImg;
var defaultScaleFactor = 0.8;
var defaultWidth, defaultHeight;

var floorplan;

window.addEventListener("load", async function() {
    mapImg = document.getElementById("mapImg");
    initDefaultSizes();

    floorplan = await getFloorplan();

    await populateSegmentModeSettingsOptions();
    await renderAllLights();
    await updateLightCachedColors();
    await setPageLightColors();
})

function initDefaultSizes() {
    var originalImageWidth = mapImg.naturalWidth;
    var originalImageHeight = mapImg.naturalHeight;

    var widthRatio = window.innerWidth / originalImageWidth;
    var heightRatio = window.innerHeight / originalImageHeight;

    var scaleFactor = Math.min(widthRatio, heightRatio) * defaultScaleFactor;
    defaultWidth = originalImageWidth*scaleFactor;
    defaultHeight = originalImageHeight*scaleFactor;

    mapImg.width = lights.width = defaultWidth;
    mapImg.height = lights.height = defaultHeight;
}

function convertImageCoordsToFloorCoords([x, y]) {
    var scaledY = Math.round(y * floorplan.height / mapImg.height);
    var scaledX = Math.round(x * floorplan.width / mapImg.width);
    return [scaledX, scaledY]
}

function convertFloorCoordsToImageCoords([x, y]) {
    var scaledY = y * mapImg.height / floorplan.height;
    var scaledX = x * mapImg.width / floorplan.width;
    return [scaledX, scaledY]
}

function dist([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
}

HTMLElement.prototype.getStyleLeft = function() {
    if (this.style.left == "") return 0;
    return Math.round(Number(this.style.left.substring(0, this.style.left.length-2)));
}

HTMLElement.prototype.getStyleTop = function() {
    if (this.style.top == "") return 0;
    return Math.round(Number(this.style.top.substring(0, this.style.top.length-2)));
}

async function doSetAll() {
    await setAll(colorSetInput.value);
    await refreshLights();
}

async function doBrowse() {
    colorSetInput.value = await selectColor();
}