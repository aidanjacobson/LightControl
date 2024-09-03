/*
    Gradient: [
        GradientStop: {
            color: Color,
            percent: Number range[0, 1]
        }
    ]
*/

var Color = require("./color");
var fp = require("./lightcommand/floorplan"), floorplan = {};
var utils = require("./utils");
const interpolation = require("./interpolation")
const settingsLoader = require("./settings");

var Gradient = function(stops=[], angle=0) {
    function sortGradient(gradient) {
        return gradient.sort((a, b)=>a.percent-b.percent);
    }
    var convertColors = function() {
        _this.stops = _this.stops.map(stop=>{
            stop.color = Color.from(stop.color);
            return stop;
        })
    }

    var _this = this;
    _this.stops = sortGradient(stops);
    _this.angle = angle;

    _this.addStop = function(stop) {
        _this.stops.push(stop);
        _this.stops = sortGradient(_this.stops);
        convertColors();
        converted = true;
    }

    var converted = false;
    _this.getColorAtPercent = function(percent) {
        if (!converted) {
            converted = true;
            convertColors();
        }
        if (percent <= _this.stops[0].percent) return _this.stops[0].color;
        if (percent >= _this.stops[_this.stops.length-1].percent) return _this.stops[_this.stops.length-1].color;
        for (var i = 0; i < _this.stops.length-1; i++) {
            var stop = _this.stops[i];
            var nextStop = _this.stops[i+1];
            if (percent >= stop.percent && percent <= nextStop.percent) {
                return interpolation.scaleBetweenColors(percent, stop.percent, nextStop.percent, stop.color, nextStop.color);
            }
        }
    }

    _this.withAngle = function(newAngle) {
        if (typeof newAngle == "undefined") {
            return new Gradient(_this.stops.slice(), _this.angle);
        }
        return new Gradient(_this.stops.slice(), newAngle);
    }

    _this.convertToCSSGradient = function() {
        convertColors();
        var components = [];
        components.push(`${_this.angle+90}deg`);
        _this.stops.forEach(function(stop) {
            components.push(`rgba(${stop.color.r}, ${stop.color.g}, ${stop.color.b}, 1) ${stop.percent*100}%`);
        })
        return `linear-gradient(${components.join(", ")})`;
    }

    _this.addPadding = function(amount) {
        var scaleFactor = 1-amount*2;
        var newStops = _this.stops.map(stop=>({percent: amount+stop.percent*scaleFactor, color: stop.color}));
        return new Gradient(newStops, _this.angle);
    }

    _this.reflect = function(right=true) {
        var newStops = [];
        for (var i = 0; i < _this.stops.length; i++) {
            var currentStop = _this.stops[i];
            if (right) {
                var leftPercent = currentStop.percent/2;
                var rightPercent = 1-leftPercent;
                newStops.push({color: currentStop.color, percent: leftPercent}, {color: currentStop.color, percent: rightPercent});
            } else {
                var rightPercent = currentStop.percent/2+0.5;
                var leftPercent = 1-rightPercent;
                newStops.push({color: currentStop.color, percent: leftPercent}, {color: currentStop.color, percent: rightPercent});
            }
        }
        return new Gradient(newStops).withAngle(_this.angle);
    }

    _this.reverse = function() {
        var newStops = [];
        for (var i = 0; i < _this.stops.length; i++) {
            newStops[i] = {color: _this.stops[i].color, percent: 1 - _this.stops[i].percent};
        }
        return new Gradient(newStops, _this.angle);
    }

    _this.rotate = function(angle) {
        return _this.withAngle((_this.angle+angle)%360);
    }

    _this.toColorList = function() {
        return _this.stops.map(stop=>stop.color);
    }

    _this.convertToColorCommandFunction = async function() {
        var gradientAngleMode = await settingsLoader.getSetting("gradientAngleMode")
        floorplan = fp.getFloorplan();
        /*
            angleModes: rotateCoords, rotateAndScaleCoords, magicCorners
        */
        if (gradientAngleMode == "magicCorners") {
            var degrees = utils.mod360(_this.angle);
            var rads = degrees/180*Math.PI;
            var m = Math.tan(rads);
            var w = floorplan.width/2;
            var h = floorplan.height/2;
            var wf = (degrees >= 0 && degrees < 90) || (degrees >= 180 && degrees < 270) ? 1 : -1;
            var pf = (degrees >= 0 && degrees < 90) || (degrees >= 270 && degrees < 360) ? 1 : -1;

            var gradientLineEndX = (w + wf*h*m) / (m*m + 1);
            var gradientLineEndY = m * gradientLineEndX;
            var gradientLineVectorLength = utils.distance(gradientLineEndX, gradientLineEndY)
            var gradientLineUnitX = gradientLineEndX / gradientLineVectorLength;
            var gradientLineUnitY = gradientLineEndY / gradientLineVectorLength;
            return function(light) {
                var translatedX = light.x - w;
                var translatedY = light.y - h;
                var gradientLineDotProduct = translatedX * gradientLineUnitX + translatedY * gradientLineUnitY;
                var fromNegativeOneToOne = gradientLineDotProduct / gradientLineVectorLength;
                var percent = ((pf * fromNegativeOneToOne) + 1) / 2;
                return _this.getColorAtPercent(percent);
            }
        } else {
            return function(light) {
            var [x, _] = utils.rotateFloorplanCoords(light, _this.angle);
            if (gradientAngleMode == "rotateAndScaleCoords") {
                x = applyScaleFactorFromCenter(x, getScaleFactorFromAngle(_this.angle));
            }
            var percent = utils.scale(x, 0, floorplan.width, 0, 1);
            return _this.getColorAtPercent(percent);
        }
        }
    }
}

Gradient.concat = function(colorA, colorB) {
    colorA = Color.from(colorA);
    colorB = Color.from(colorB);
    if (colorA.type != "gradient" && colorB.type != "gradient") return "black";
    if (colorA.type == "gradient" && colorB.type != "gradient") return colorA;
    if (colorB.type == "gradient" && colorA.type != "gradient") return colorB;
    var stopsOut = [];
    for (var stop of colorA.gradient.stops) {
        var newPercent = stop.percent / 2;
        stopsOut.push({color: stop.color, percent: newPercent});
    }
    for (var stop of colorB.gradient.stops) {
        var newPercent = stop.percent / 2 + 0.5;
        stopsOut.push({color: stop.color, percent: newPercent});
    }
    var newAngle = colorA.gradient.angle;
    return new Gradient(stopsOut, newAngle);
}

Gradient.reverse = function(gradient) {
    return Color.from(gradient).gradient.reverse();
}


function getScaleFactorFromAngle(angle) {
    var x = (utils.cosDeg(2*angle)+1)/2;
    var sf = utils.scale(x, 0, 1, floorplan.width/floorplan.height, 1);
    return sf;
}

function applyScaleFactorFromCenter(x, sf) {
    var center = floorplan.width/2;
    return center + (x-center)*sf;
}

Gradient.rainbow = new Gradient([
    {percent: .1, color: "#ff0000"},
    {percent: .15, color: "#ff8c00"},
    {percent: .4, color: "#ffff00"},
    {percent: .45, color: "#00ff00"},
    {percent: .8, color: "#0000ff"},
    {percent: .9, color: "#aa00ff"}
]);

Gradient.quickGradient = function(color1, color2, angle=0) {
    return new Gradient([{percent: 0.1, color: color1}, {percent: 0.9, color: color2}], angle);
}

Gradient.evenlySpaced = function(colorList, padding=0.1) {
    var gradientArray = [];
    var workingSpace = 1 - 2*padding;
    var separation = workingSpace/(colorList.length-1);
    for (var i = 0; i < colorList.length; i++) {
        gradientArray.push({color: colorList[i], percent: padding+separation*i});
    }
    return new Gradient(gradientArray);
}

Gradient.areEqual = function(g1, g2) {
    if (g1.angle != g2.angle) return false;
    if (g1.stops.length != g2.stops.length) return false;
    for (var i = 0; i < g1.stops.length; i++) {
        if (g1.stops[i].percent != g2.stops[i].percent) return false;
        if (!utils.colorsAreEqual(g1.stops[i].color, g2.stops[i].color)) return false;
    }
    return true;
}

Gradient.construct = function(...args) {
    return new Gradient(...args);
}

module.exports = Gradient;