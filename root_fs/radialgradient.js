const fp = require("./lightcommand/floorplan");
const Color = require("./color");
const utils = require("./utils");

/*
    RadialGradient(stops: RadialStop[], coordinates: [0, 0]) {
        stops: RadialStop[] {
            color: Color
            percent: Number[0..1]
        }
        coordinates: [Number[-1..1], Number[-1..1]]
    }
*/

class RadialGradient {
    stops = [];
    coordinates = [0, 0];
    scaleFactor = 1;
    maxDistance='width';
    constructor (stops=[], coordinates=[0,0], scaleFactor=1, max='width') {
        stops.forEach(stop=>this.addStop(stop));
        this.stops = RadialGradient.sortStops(this.stops);
        this.coordinates = coordinates;
        this.scaleFactor = scaleFactor;
        this.maxDistance = max;
    }

    static sortStops(stops) {
        return stops.sort((a,b)=>a.percent-b.percent);
    }

    setStops(stops) {
        this.stops = stops;
    }

    setCoordinates(coordinates) {
        this.coordinates = coordinates;
    }

    addStop({color, percent}) {
        this.stops.push(new RadialGradientStop(color, percent));
    }

    getColorAtCoordinates(x, y) {
        var floorplan = fp.getFloorplan();
        var centerX = utils.scale(this.coordinates[0], -1, 1, 0, floorplan.width);
        var centerY = utils.scale(this.coordinates[1], -1, 1, 0, floorplan.height);
        var distance = utils.distance(centerX, centerY, x, y);
        var maxDistance = floorplan.width/2;
        if (this.maxDistance == 'height') {
            maxDistance = floorplan.height/2;
        }
        return this.getColorAtPercent(utils.scale(distance, 0, maxDistance, 0, 1));
    }

    getColorAtPercent = function(percent) {
        if (percent <= this.stops[0].percent * this.scaleFactor) return this.stops[0].color;
        if (percent >= this.stops[this.stops.length-1].percent * this.scaleFactor) return this.stops[this.stops.length-1].color;
        for (var i = 0; i < this.stops.length-1; i++) {
            var stop = this.stops[i];
            var nextStop = this.stops[i+1];
            if (percent >= stop.percent * this.scaleFactor && percent <= nextStop.percent * this.scaleFactor) {
                return utils.scaleBetweenColors(percent, stop.percent * this.scaleFactor, nextStop.percent * this.scaleFactor, stop.color, nextStop.color);
            }
        }
    }

    convertToColorCommandFunction() {
        var _this = this;
        return function(light) {
            return _this.getColorAtCoordinates(light.x, light.y);
        }
    }

    static construct(...args) {
        return new RadialGradient(...args);
    }
}

class RadialGradientStop {
    color;
    percent;
    constructor(color, percent) {
        this.color = Color.from(color);
        this.percent = percent;
    }
}

module.exports = RadialGradient;