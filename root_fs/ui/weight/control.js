
var lastID = 0;
function generateID() {
    return lastID++;
}
var angleLineDegrees = [{degrees: 0, weight: 1, id: generateID()}];

window.addEventListener("load", function() {
    stage.addEventListener("mousedown", canvasMouseDown);
    stage.addEventListener("mouseup", canvasMouseUp);
    stage.addEventListener("mousemove", canvasMouseMove);
    stage.addEventListener("contextmenu", (e)=>{e.preventDefault();});
})


var editingHandle = false;
var editingHandleIndex = -1;

function canvasMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;
    var distance = dist(mouseX, mouseY, centerX, centerY);
    if (e.button == 0 && distance >= circleRadius - circleEdgeTolerance && distance <= circleRadius + circleEdgeTolerance) {
        circleEdgeClick(mouseX-centerX, mouseY-centerY);
    } else if (e.button == 2) {
        circleEdgeDelete(mouseX-centerX, mouseY-centerY);
    } else if (e.button == 0 && distance < circleRadius - circleEdgeTolerance) {
        regionClick(mouseX-centerX, mouseY-centerY);
    } else if (e.button == 0 && distance > circleRadius + circleEdgeTolerance) {
        outerCircleClick();
    }
}

function canvasMouseUp(e) {
    if (editingHandle) {
        editingHandle = false;
        editingHandleIndex = -1;
        handleHandleEdited();
    }
}

function canvasMouseMove(e) {
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;
    if (editingHandle && editingHandleIndex != -1) {
        var degrees = getDegreesToPoint(mouseX, mouseY, centerX, centerY);
        angleLineDegrees[editingHandleIndex].degrees = degrees;
        var originalID = angleLineDegrees[editingHandleIndex].id;
        handleHandleEdited();
        var newIndex = angleLineDegrees.findIndex(obj=>obj.id==originalID);

        var indexDifference = newIndex-editingHandleIndex;
        if (editingRegion && editingRegionIndex != -1 && editingRegionIndex + indexDifference >= -1) {
            editingRegionIndex += indexDifference;
        }
        if (editingRegionIndex<-1) editingRegionIndex=-1;
        editingHandleIndex = newIndex;
    }
    if (angleLineDegrees.length == 0) {
        editingRegionIndex = -1;
        editingRegion = false;
    }
}

function circleEdgeClick(relX, relY) {
    for (var i = 0; i < angleLineDegrees.length; i++) {
        var degrees = angleLineDegrees[i].degrees;
        var radians = deg2rad(degrees);
        var endX = Math.cos(radians)*circleRadius;
        var endY = Math.sin(radians)*circleRadius;
        if (dist(endX, endY, relX, relY) <= circleHandleRadius) {
            editingHandle = true;
            editingHandleIndex = i;
            return;
        }
    }

    // if you are here, a handle was not found. create a new one
    var newDegrees = getDegreesToPoint(relX, relY);
    angleLineDegrees.push({degrees: newDegrees, weight: 1, id: generateID()});
    editingHandle = true;
    editingHandleIndex = angleLineDegrees.length - 1;
}

function handleHandleEdited() {
    // angleLineDegrees = angleLineDegrees.map(a=>Math.round(a)).map(mod360).sort((a,b)=>a-b);
    angleLineDegrees.forEach(obj=>obj.degrees=mod360(Math.round(obj.degrees)));
    angleLineDegrees.sort((a,b)=>a.degrees-b.degrees);
}

function circleEdgeDelete(relX, relY) {
    for (var i = 0; i < angleLineDegrees.length; i++) {
        var degrees = angleLineDegrees[i].degrees;
        var radians = deg2rad(degrees);
        var endX = Math.cos(radians)*circleRadius;
        var endY = Math.sin(radians)*circleRadius;
        var distance = dist(endX, endY, relX, relY);
        if (distance <= circleHandleRadius) {
            var newWeight = angleLineDegrees[i].weight;
            if (angleLineDegrees.length > 1) {
                var firstWeight = angleLineDegrees[i].weight;
                var nextIndex = i+1;
                if (nextIndex >= angleLineDegrees.length) {
                    nextIndex -= angleLineDegrees.length;
                }
                var secondWeight= angleLineDegrees[nextIndex].weight;
                // newWeight = firstWeight + secondWeight;
            }
            angleLineDegrees.splice(i, 1);
            if (editingRegionIndex >= i) editingRegionIndex--;
            angleLineDegrees[(i-1+angleLineDegrees.length)%angleLineDegrees.length].weight = newWeight;
            if (angleLineDegrees.length == 0) {
                angleLineDegrees = [{degrees: 0, weight: 1, id: generateID()}];
            }
        }
    }
}

function regionClick(relX, relY) {
    if (editingRegion && editingRegionIndex != -1) {
        editWeightChanged()
    }
    var clickDeg = mod360(getDegreesToPoint(relX, relY));
    var found = false;
    for (var i = 0; i < angleLineDegrees.length-1; i++) {
        var nextDeg = mod360(angleLineDegrees[(i+1) % angleLineDegrees.length].degrees);
        if (nextDeg < currentDeg) nextDeg += 360;
        var currentDeg = mod360(angleLineDegrees[i].degrees);
        if (clickDeg >= currentDeg && clickDeg < nextDeg) {
            editingRegion = true;
            editingRegionIndex = i;
            found = true;
        }
    }
    if (!found) {
        editingRegion = true;
        editingRegionIndex = angleLineDegrees.length-1;
    }

    editControls.show();
    editWeightInput.value = angleLineDegrees[editingRegionIndex].weight;
}

function editWeightChanged() {
    angleLineDegrees[editingRegionIndex].weight = +editWeightInput.value;
}

var editingRegion = false;
var editingRegionIndex = -1;
function outerCircleClick() {
    editingRegion = false;
    editingRegionIndex = -1;
    editControls.hide();
}