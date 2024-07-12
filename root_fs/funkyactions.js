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

function randomDark(lightObj) {
    var darkWeight = 2;
    var lightWeight = 1;

    var darkInterval = [120, 300];
    var lightInterval = [300, 480];
    
    var cutOff = darkWeight/(darkWeight+lightWeight);
    var darkSide = Math.random() < cutOff;

    var random = Math.random();
    var interval = darkSide ? darkInterval : lightInterval;
    var hue = utils.scale(random, 0, 1, interval[0], interval[1]);
    return `hue(${hue})`;
}

/*
    intervals = [...[start, end, weight]]
*/
function randomWeightedInterval(intervals) {
    var intervalSum = 0;
    for (var interval of intervals) {
        var angleDiff = utils.mod360(interval[1]-interval[0]);
        var weight = interval[2];
        // weight *= angleDiff/360;
        intervalSum += weight;
    }
    return function(lightObj) {
        var randomNumber = Math.random()*intervalSum;
        var chooseInterval = [0, 0];
        var total = 0;
        for(var i = 0; i < intervals.length; i++) {
            var [start, end, weight] = intervals[i];
            console.assert(end-start > 0, "End angle - start angle <= 0");
            var angleDiff = utils.mod360(end-start);
            // weight *= angleDiff/360;
            total += weight;
            if (randomNumber < total) {
                chooseInterval[0] = start;
                chooseInterval[1] = end;
                break;
            }
        }
        var hue = utils.scale(Math.random(), 0, 1, chooseInterval[0], chooseInterval[1]);
        return `hue(${hue})`;
    }
}

module.exports = {shuffle, themerize, HSLInvert, hslSpectrum, hslCircle, randomDark, randomWeightedInterval};