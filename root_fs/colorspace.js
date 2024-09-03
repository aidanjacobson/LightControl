var Color = require("./color");
var utils = require("./utils");
var fp = require("./lightcommand/floorplan"), floorplan = {};
const interpolation = require("./interpolation");

(async function() {
    floorplan = await fp.getFloorplan();
})();

class ColorSpace {
    constructor(corners) {
        (async function() {
            floorplan = await fp.getFloorplan();
        })();
        if (corners instanceof Array) {
            this.corners = {};
            [this.corners.topleft, this.corners.topright, this.corners.bottomright, this.corners.bottomleft, this.angle] = corners;
            if (typeof this.angle == "undefined") this.angle = 0;
            this.angle = +this.angle;
        } else {
            if (typeof corners.angle == "undefined") corners.angle = 0;
            this.corners = {topright: corners.topright, topleft: corners.topleft, bottomleft: corners.bottomleft, bottomright: corners.bottomright};
            this.angle = +corners.angle;
        }
        this.corners.topright = Color.from(this.corners.topright);
        this.corners.topleft = Color.from(this.corners.topleft);
        this.corners.bottomright = Color.from(this.corners.bottomright);
        this.corners.bottomleft = Color.from(this.corners.bottomleft);
    }

    static from(c) {
        return new ColorSpace(c);
    }

    convertToColorCommandFunction() {
        var _this = this;
        var topright = _this.corners.topright;
        var topleft = _this.corners.topleft;
        var bottomright = _this.corners.bottomright;
        var bottomleft = _this.corners.bottomleft;

        if (topright.type == "function") {
            topright = Color.from(topright.func());
        }
        if (topleft.type == "function") {
            topleft = Color.from(topleft.func());
        }
        if (bottomright.type == "function") {
            bottomright = Color.from(bottomright.func());
        }
        if (bottomleft.type == "function") {
            bottomleft = Color.from(bottomleft.func());
        }
        return function(light) {
            var x, y;
            if (typeof _this.angle == "undefined" || light.angle == 0) {
                x = light.x;
                y = light.y;
            } else {
                [x, y] = utils.rotateFloorplanCoords(light, _this.angle);
            }
            // var x = compress(light.x, floorplan.width);
            // var y = compress(light.y, floorplan.height);

            // var leftColor = interpolation.scaleBetweenColors(y, 0, floorplan.height, ne, se);
            // var rightColor = interpolation.scaleBetweenColors(y, 0, floorplan.height, nw, sw);
            // var centerColor1 = interpolation.scaleBetweenColors(x, 0, floorplan.width, leftColor, rightColor);
            // var topColor = interpolation.scaleBetweenColors(x, 0, floorplan.width, ne, nw);
            // var bottomColor = interpolation.scaleBetweenColors(x, 0, floorplan.width, se, sw);
            // var centerColor2 = interpolation.scaleBetweenColors(y, 0, floorplan.height, topColor, bottomColor);
            // var centerColor = Color.average(centerColor1, centerColor2);
            // return centerColor;
            if (x < floorplan.width / 2 && y < floorplan.height / 2) {
                return topleft;
            }
            if (x >= floorplan.width / 2 && y < floorplan.height / 2) {
                return topright;
            }
            if (x < floorplan.width / 2 && y >= floorplan.height / 2) {
                return bottomleft;
            }
            if (x >= floorplan.width / 2 && y >= floorplan.height / 2) {
                return bottomright;
            }
        }
    }
}

function compress(input, max) {
    var percent = input / max;
    var newPercent = getNewPercent(percent);
    return input * newPercent;
}

// function getNewPercent(percent) {
//     return 1 - Math.sqrt(1-percent*percent);
// }

function getNewPercent(percent) {
    if (percent < 1/3) {
        return onLine(percent, 0, 0, 1/3, 1/4);
    }
    if (percent >= 1/3 && percent < 2/3) {
        return onLine(percent, 1/3, 1/4, 2/3, 3/4);
    }
    if (percent >= 2/3) {
        return onLine(percent, 2/3, 3/4, 1, 1);
    }
}

function onLine(x,x1,y1,x2,y2) {
    return utils.scale(x, x1, x2, y1, y2)
}

module.exports = ColorSpace;