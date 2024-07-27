/*
    intervals = [...[start, end, weight]]
*/

function createWeightedRandomCode() {
    var intervalList = [];
    for (var i = 0; i < angleLineDegrees.length; i++) {
        var startDeg = angleLineDegrees[i].degrees;
        var endIndex = i+1;
        var endDeg;
        if (endIndex >= angleLineDegrees.length) {
            endIndex -= angleLineDegrees.length;
            endDeg = angleLineDegrees[endIndex].degrees + 360;
        } else {
            endDeg = angleLineDegrees[endIndex].degrees;
        }
        var weight = angleLineDegrees[i].weight;
        intervalList.push(`[${startDeg}, ${endDeg}, ${weight}]`);
    }
    var weightedRandomCode = `[${intervalList.join(", ")}]`;
    return weightedRandomCode;
}

function createWeightedRandomSetAllCommand() {
    return `eval(funky.randomWeightedInterval(${createWeightedRandomCode()}))`;
}

function readFromRandomCode() {
    var inCode = prompt("enter code");
    if (!inCode) return;

    var intervalArrayArray = JSON.parse(inCode);
    editingHandle = editingRegion = false;
    editingHandleIndex = editingRegionIndex = -1;
    var newAngleLineDegrees = [];
    for (var [start, stop, weight] of intervalArrayArray) {
        newAngleLineDegrees.push({degrees: start, weight: weight, id: generateID()});
    }
    angleLineDegrees = newAngleLineDegrees;
}

function apiPost(path, data) {
    return new Promise(function(resolve, reject) {
        var baseURL = location.origin;
        var x = new XMLHttpRequest();
        var url = `${baseURL}${path}`;
        if (path[0] != "/") url = `${baseURL}/${path}`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.setRequestHeader("Origin-ID", "lightcontrol-ui")
        x.setRequestHeader("Security-key", localStorage.lightcontrol_key)
        x.onload = function() {
            try {
                resolve(JSON.parse(x.responseText));
            } catch(e) {
                console.log(path, data, e);
            }
        }
        x.send(JSON.stringify(data));
    })
}

async function setAll(color) {
    await apiPost("/setAll", {color});
}

async function sendGradient() {
    await setAll(createWeightedRandomSetAllCommand());
}

function copyClipboard(text) {
    navigator.clipboard.writeText(text);
}