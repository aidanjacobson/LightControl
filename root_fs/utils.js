const Color = require("./color");
var fp = require("./lightcommand/floorplan"), floorplan = {};
const settings = require("./settings");
const interpolation = require("./interpolation");

function randBetween(a, b) {
    var diff = b-a;
    return Math.round(Math.random()*diff+a);
}

function scale(x, low, high, newLow, newHigh) {
    var percent = (x-low)/(high-low);
    return newLow + (newHigh-newLow)*percent;
}

// function scaleBetweenColors(x, low, high, color1, color2) {
//     var percent = (x-low)/(high-low);
//     return getColorInterpolation(percent, color1, color2);
// }

// function getColorInterpolation(...args) {
//     var mode = settings.getSettingSync("colorLinearInterpolationMode");
//     if (mode == "linearScale") {
//         return interpolation.getPercentBetweenColors(...args)
//     }
//     if (mode == "")
// }

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function rotateFloorplanCoords(click, angle) {
    floorplan = fp.getFloorplan();
    //console.log(floorplan);
    var cx = floorplan.width/2;
    var cy = floorplan.height/2;
    var rotated = rotate(cx, cy, click.x, click.y, angle);
    return rotated;
}

function removeDuplicateColors(colorList) {
    const removeBlackAsWell = true;
    return colorList.filter(function (colorIn,i) {
        var firstTimeSeen = colorList.indexOfFunction(e=>colorsAreEqual(e,colorIn))==i;
        var black = isBlack(colorIn);
        return firstTimeSeen && (!removeBlackAsWell || !black)
    }).map(Color.from);
}

function isBlack(colorIn) {
    var color = Color.from(colorIn);
    return color.type == "rgb" &&  color.r == 0 && color.g == 0 && color.b == 0;
}

function colorsAreEqual(c1, c2) {
    var color1 = Color.from(c1);
    var color2 = Color.from(c2);
    if (color1.type == "rgb" && color2.type == "rgb") {
        return color1.r == color2.r && color1.g == color2.g && color1.b == color2.b;
    } else if (color1.type == "gradient" && color2.type == "gradient") {
        return gradientsAreEqual(color1.gradient, color2.gradient);
    } else {
        return color1 == color2;
    }
}

gradientsAreEqual = function(g1, g2) {
    if (g1.angle != g2.angle) return false;
    if (g1.stops.length != g2.stops.length) return false;
    for (var i = 0; i < g1.stops.length; i++) {
        if (g1.stops[i].percent != g2.stops[i].percent) return false;
        if (!colorsAreEqual(g1.stops[i].color, g2.stops[i].color)) return false;
    }
    return true;
}

Array.prototype.indexOfFunction = function(callFunc) {
    for (var i = 0; i < this.length; i++) {
        if (callFunc(this[i], i, this)) return i;
    }
    return -1;
}

function deg2rad(deg) {
    return deg/180*Math.PI;
}

function sinDeg(angle) {
    return Math.sin(deg2rad(angle));
}

function cosDeg(angle) {
    return Math.cos(deg2rad(angle));
}

function distance(x1, y1, x2=0, y2=0) {
    return Math.sqrt((x2-x1)**2+(y2-y1)**2);
}

function mod360(n) {
    if (n >= 0) return n % 360;
    return n + Math.ceil(-n/360)*360;
}

module.exports = {interpolation: require("./interpolation"), mod360, distance, randBetween, scale, colorsAreEqual, removeDuplicateColors, rotate, rotateFloorplanCoords, deg2rad, sinDeg, cosDeg};