window.addEventListener("load", function() {
    clickContainer.addEventListener("pointerdown", selectMouseDown);
    window.addEventListener("pointerup", selectMouseUp);
})

var windowMouseX = 0;
var windowMouseY = 0;
window.addEventListener("pointermove", function(e) {
    if (dragging) {
        lightMouseMoveFunction(e);
    } else {
        windowMouseX = e.pageX;
        windowMouseY = e.pageY;
        selectBoxParams[2] = windowMouseX - selectBoxParams[0];
        selectBoxParams[3] = windowMouseY - selectBoxParams[1];
        // console.log(mouseDown, windowMouseX, windowMouseY);
        renderSelectBox();
    }
})

var dragStartX = 0;
var dragStartY = 0;
var mouseDown = false;
function selectMouseDown(e) {
    e.preventDefault();
    if (selectedLights.length == 1 && doesLightContainPoint(selectedLights[0], e.pageX, e.pageY)) {
        lightMouseDownFunction(selectedLights[0], e);
    } else {
        if (!e.shiftKey) selectedLights = [];
        setSelectedLights();
        mouseDown = true;
        dragStartX = e.pageX;
        dragStartY = e.pageY;
        selectBoxParams = [dragStartX, dragStartY, 0, 0];
    }
}

function selectMouseUp(e) {
    if (selectedLights.length == 1 && doesLightContainPoint(selectedLights[0], e.pageX, e.pageY)) {
        lightMouseUpFunction();
    } else if (mouseDown) {
        windowMouseX = e.pageX;
        windowMouseY = e.pageY;
        mouseDown = false;
        renderSelectBox();
        var newSelectedLights = getSelectedLights(...selectBoxParams);
        if (e.shiftKey && newSelectedLights.every(light=>selectedLights.indexOf(light) > -1)) {
            selectedLights = selectedLights.filter(l=>newSelectedLights.indexOf(l) == -1);
            console.log(newSelectedLights);
        } else {
            selectedLights.push(...newSelectedLights);
            selectedLights = selectedLights.filter((e,i,a)=>a.indexOf(e)==i);
        }
        setSelectedLights();
    }
}

function renderSelectBox() {
    if (mouseDown) {
        selectbox.show();
        setSelectBox(dragStartX, dragStartY, windowMouseX, windowMouseY);
    } else {
        selectbox.hide();
    }
}

var selectedLights = [];
var selectBoxParams = [0, 0, 0, 0];
function setSelectBox(x1, y1, x2, y2) {
    var width = Math.abs(x2-x1);
    var height = Math.abs(y2-y1);
    var left = Math.min(x1, x2);
    var top = Math.min(y1, y2);
    selectbox.style.left = left;
    selectbox.style.top = top;
    selectbox.style.width = width;
    selectbox.style.height = height;
    selectBoxParams = [left, top, width, height];
}

function getSelectedLights(x, y, w, h) {
    var allLights = document.querySelectorAll(".lightbulb");
    var out = [];
    for (var light of allLights) {
        const bb = light.getBoundingClientRect();
        const lightX = bb.left + bb.width/2;
        const lightY = bb.top + bb.height/2;
        // console.log(17, lightX, lightY, x, y, x+w, y+h);
        if (checkCircleRectangleOverlap(17, lightX, lightY, x, y, x+w, y+h)) {
            out.push(light);
        }
    }
    return out;
}

function doesLightContainPoint(light, x, y) {
    const bb = light.getBoundingClientRect();
    const lightX = bb.left + bb.width/2;
    const lightY = bb.top + bb.height/2;
    const dx = x - lightX;
    const dy = y - lightY;
    const radius = 17;
    return (dx*dx + dy*dy <= radius*radius);
}

function checkCircleRectangleOverlap(radius, circleX, circleY, x1, y1, x2, y2) {
    const xn = Math.max(x1, Math.min(circleX, x2));
    const yn = Math.max(y1, Math.min(circleY, y2));
    const dx = xn - circleX;
    const dy = yn - circleY;
    return (dx*dx + dy*dy) <= radius*radius;
}