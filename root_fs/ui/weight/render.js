const circleRadius = 150;
const circleEdgeTolerance = 10;
const circleHandleRadius = 7;

var stage, ctx;
var centerX, centerY;

var hslCircleImage = new Image();
hslCircleImage.src = "img/hslcircle.png";

window.onload = async function() {
    stage = document.getElementById("stage");
    ctx = stage.getContext("2d");
    centerX = stage.width/2;
    centerY = stage.width/2;

    await imageLoad(hslCircleImage);
    // document.body.append(hslCircleImage);

    renderStage();
}

function renderStage() {
    requestAnimationFrame(renderStage);

    clearCanvas();
    drawHSLCircle();
    drawRegionData();
    drawAngleLines();
}

function clearCanvas() {
    stage.width = stage.width;
}

function drawHSLCircle() {
    // for (var x = 0; x < stage.width; x++) {
    //     for (var y = 0; y < stage.height; y++) {
    //         var distToCenter = dist(x, y, centerX, centerY);
    //         if (distToCenter < circleRadius) {
    //             var degrees = getDegreesToPoint(x, y, centerX, centerY);
    //             var [r, g, b] = HSLToRGB([degrees, 100, 50]);
    //             canvasPixel(x, y, r, g, b);
    //         }
    //     }
    // }

    ctx.drawImage(hslCircleImage, 0, 0);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, TAU);
    ctx.stroke();
}

function canvasPixel(x, y, r, g, b) {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b})`;
    ctx.fillRect(x, y, 1, 1);
}

function drawAngleLines() {
    if (typeof angleLineDegrees === "undefined" || angleLineDegrees.length == 0) return;
    ctx.lineWidth = 2;
    for (var i = 0; i < angleLineDegrees.length; i++) {
        var degrees = angleLineDegrees[i].degrees;
        var radians = deg2rad(degrees);
        var endX = Math.cos(radians)*circleRadius + centerX;
        var endY = Math.sin(radians)*circleRadius + centerY;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.fillStyle = "white";
        if (editingHandleIndex == i) ctx.fillStyle = "lightgray";
        ctx.beginPath();
        ctx.arc(endX, endY, circleHandleRadius, 0, TAU);
        ctx.stroke();
        ctx.fill();
    }
}

function drawRegionData() {
    if (editingRegion && editingRegionIndex != -1) {
        drawRegionSurroundingLine();
    }
    drawRegionNumbers();
}

function drawRegionSurroundingLine() {
    if (editingRegionIndex != -1)
    var endDegreesIndex = editingRegionIndex+1;
    var startDegreesIndex = editingRegionIndex;
    if (endDegreesIndex >= angleLineDegrees.length) endDegreesIndex -= angleLineDegrees.length;
    var startAngle = angleLineDegrees[startDegreesIndex].degrees;
    var endAngle = angleLineDegrees[endDegreesIndex].degrees;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(...translateFrom(getPointOnCircleWithDegrees(startAngle), [centerX, centerY]));
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(...translateFrom(getPointOnCircleWithDegrees(endAngle), [centerX, centerY]));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, deg2rad(startAngle), deg2rad(endAngle));
    ctx.stroke();
}

function drawRegionNumbers() {
    if (angleLineDegrees.length == 0) return;
    for (var i = 0; i < angleLineDegrees.length; i++) {
        var startIndex = i;
        var startDeg = angleLineDegrees[startIndex].degrees;
        
        var endIndex = i+1;
        var endDeg = 0;
        if (endIndex >= angleLineDegrees.length) {
            endIndex = endIndex % angleLineDegrees.length;
            endDeg = angleLineDegrees[endIndex].degrees + 360;
        } else {
            endDeg = angleLineDegrees[endIndex].degrees;
        }

        var newDeg = (startDeg+endDeg)/2;

        var textPoint = translateFrom(getPointOnCircleWithDegrees(newDeg, 100), [centerX,centerY]);
        
        ctx.font = "30px arial";
        ctx.fillText(angleLineDegrees[i].weight, textPoint[0], textPoint[1]);
    }
}