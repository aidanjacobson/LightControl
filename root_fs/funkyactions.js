var shuffleMap = {};
var lastShuffleTime = 0;
var light = require("./lightcommand/light");
var random = require("./random");
var utils = require("./utils");

function shuffle(lightObject, floorplan) {
    if (Date.now()-lastShuffleTime > 3000) {
        lastShuffleTime = Date.now();
        shuffleMap = transformProperties(mapper(floorplan.lights.map(lightObj=>lightObj.entity)), entity=>light.getLightColor(entity));
    }
    return shuffleMap[lightObject.entity];
}

function transformProperties(obj, func) {
    var out = {};
    for (var prop in obj) {
        out[prop] = func(obj[prop]);
    }
    return out;
}

function mapper(names) {
    var map = {};
    var keys = [...names];
    var values = [...names];
    while (keys.length > 0 && values.length > 0) {
        var index1 = Math.floor(Math.random()*keys.length);
        var index2 = Math.floor(Math.random()*values.length);
        map[keys[index1]] = values[index2];
        keys.splice(index1, 1);
        names.splice(index2, 1);
    }
    return map;
}

function themerize(variance) {
        return function(lightObj) {
            var color = light.getLightColor(lightObj.entity);
            return random.HSLNormalDist(color, variance)();
        }
}

function HSLInvert(lightObj) {
    var color = light.getLightColor(lightObj.entity);
    var hsl = random.RGBToHSL(color);
    var newHue = (hsl.h + 180) % 360;
    return random.HSLToRGB({h: newHue, s: hsl.s, l: hsl.l});
}

function hslSpectrum(angle=0) {
    return function (lightObject, floorplan) {
        var newCoords = utils.rotateFloorplanCoords(lightObject, angle);
        return random.HSLToRGB({h: utils.scale(newCoords[0], 0, floorplan.width, 0, 360), s: 100, l: 50});
    }
}

function hslCircle(angle=0) {
    return function(lightObj, floorplan) {
        var shiftedX = lightObj.x - floorplan.width/2;
        var shiftedY = lightObj.y - floorplan.height/2;
        var deg = Math.atan2(shiftedY, shiftedX)*180/Math.PI + angle;
        return random.HSLToRGB({h: deg, s: 100, l: 50})
    }
}

module.exports = {shuffle, themerize, HSLInvert, hslSpectrum, hslCircle};