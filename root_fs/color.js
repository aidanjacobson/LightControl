var cssColors = require("./colornames/csscolornames.json");
var configLoaderColorNames = require("./colornames/colornames"), customColors = {};
var externalColors = require("./colornames/externalfiles");
var fp = require("./lightcommand/floorplan"), floorplan = {};
const { ndef, def } = require("./def_ndef");
const random = require("./random");
const ColorMapping = require("./colormapping");
const history = require("./history")

configLoaderColorNames.loadColors();

class Color {
    constructor(...args) {
        customColors = configLoaderColorNames.getColors();
        var _this = this;
        floorplan = fp.getFloorplan();
        _this.type = "";

        var Gradient = require("./gradient");
        var ColorSpace = require("./colorspace");
        var funky = require("./funkyactions");
        var RadialGradient = require("./radialgradient");

        _this.from = function (color) {
            var c = color;
            if (!isColor(color)) {
                c = new Color(color);
            }
            copyToColor(_this, c);
            return _this;
        };

        if (typeof args[0] == "undefined") {
            _this.type = "rgb";
            _this.r = _this.g = _this.b = 0;
            return;
        }

        if (args[0] instanceof Array) {
            _this.type = "rgb";
            _this.r = args[0][0];
            _this.g = args[0][1];
            _this.b = args[0][2];
        } else if (args.length > 0 && typeof args[0].r != "undefined") {
            _this.type = "rgb";
            _this.r = args[0].r;
            _this.g = args[0].g;
            _this.b = args[0].b;
        } else if (args.length > 0 && typeof args[0].url != "undefined") {
            _this.type = "url";
            _this.url = args[0].url;
        } else if (args.length > 0 && def(args[0].buffer) && Buffer.isBuffer(args[0].buffer)) {
            _this.type = "buffer",
            _this.buffer = args[0].buffer;
            _this.mimeType = args[0].mimetype;
        } else if (typeof args[0] == "number") {
            _this.type = "rgb";
            _this.r = args[0];
            _this.g = args[1];
            _this.b = args[2];
        } else if (args[0] instanceof ColorMapping) {
            _this.type = "colorMapping";
            this.mapping = args[0];
        } else if (args[0] instanceof Function) {
            _this.func = args[0];
            _this.type = "function";
        } else if (typeof args[0] !== "undefined" && typeof args[0].stops !== "undefined") {
            _this.gradient = args[0];
            _this.type = "gradient";
        } else if (typeof args[0] !== "undefined" && typeof args[0].corners !== "undefined") {
            _this.colorSpace = args[0];
            _this.type = "colorspace";
        } else if (def(args[0]) && def(args[0].coordinates)) {
            _this.radial = args[0];
            _this.type = "radial";
        } else if (typeof args[0] == "string") {
            var angle = 0;
            var inString = args[0];
            if (inString == "none") {
                _this.type = "none";
            } else if (inString.substring(0, 5) == "eval(") {
                importUserFuncs();
                var evalJS = inString.substring(5, inString.length - 1);
                var evalResult = eval(decodeURIComponent(evalJS));
                _this.from(evalResult);
            } else if (inString[0] == "{") {
                _this.from(createColorMapping(JSON.parse(inString)));
            } else if (["rgb(", "hsl(", "hue("].indexOf(inString.substring(0, 4)) > -1) {
                _this.from(eval(inString));
            } else if (inString.substring(0, 4) == "url(") {
                var url = decodeURIComponent(decodeURIComponent(inString.substring(4, inString.length-1)));
                _this.from(new Color({url:url}));
            } else if (inString.startsWith("colorspace(")) {
                var colorSpaceArguments = inString.substring("colorspace(".length, inString.length-1).split(", ");
                _this.colorSpace = ColorSpace.from(colorSpaceArguments);
                _this.type = "colorspace";
            } else if (inString.charAt(0) == "#") {
                _this.from(new Color(hashCodeToRGB(inString)));
            } else if (inString.indexOf(",") > -1) {
                // console.log(inString);
                [inString, angle] = inString.split(",");
                angle = +angle;
                _this.from(inString);
                if (_this.type == "gradient") _this.gradient = _this.gradient.rotate(angle);
            } else {
                inString = inString.toLowerCase().replace(/ /g, "").replace(/_/g, "");
                if (typeof customColors[inString] !== "undefined") {
                _this.from(customColors[inString]);
                } else if (typeof cssColors[inString] !== "undefined") {
                    _this.from(cssColors[inString]);
                } else if (typeof externalColors[inString] !== "undefined") {
                    _this.from(externalColors[inString]);
                }
            }
        }

        _this.toString = function () {
            if (_this.type == "rgb")
                return `rgb(${_this.r}, ${_this.g}, ${_this.b})`;
            if (_this.type == "function")
                return `Color Function`;
            if (_this.type == "gradient")
                return `Color Gradient ${_this.stops.join(", ")}`;
        };

        _this.toCSS = function() {
            if (_this.type == "rgb") {
                return _this.toString();
            } else if (_this.type == "gradient") {
                return _this.gradient.convertToCSSGradient();
            } else if (_this.type == "function") {
                var colorList = floorplan.lights.map(light=>Color.from(_this.func(light)));
                var colors = require("./utils").removeDuplicateColors(colorList);
                var gradient = Gradient.evenlySpaced(colors, 0);
                return gradient.convertToCSSGradient();
            }
        }
    }
    static from(color) {
        if (isColor(color)) return color;
        var out = new Color();
        if (ndef(out.toCSS)) {
            out.toCSS = ()=>"Color()";
        }
        return out.from(color);
    }
    static async reloadCustomFiles() {
        await configLoaderColorNames.loadColors();
        customColors = configLoaderColorNames.getColors();
    }

    static average(...colors) {
        var r = avgFunc(...colors.map(c=>c.r));
        var g = avgFunc(...colors.map(c=>c.g));
        var b = avgFunc(...colors.map(c=>c.b));
        return Color.from([r, g, b]);
    }
}

function avgFunc(...args) {
    return meanSquare(...args);
}

function meanSquare(...args) {
    //return args.reduce((total, item)=>total+item) / args.length;
    var value = 0;
    for (var c of args) {
        value += c*c;
    }
    value /= args.length;
    value = Math.sqrt(value);
    return value;
}

function avgArithmetic(...args) {
    return args.reduce((total, item)=>total+item) / args.length;
}


function rgb(r, g, b) {
    return new Color(r, g, b);
}

function hsl(h, s, l) {
    return HSLToRGB({h, s, l});
}

function hue(h) {
    return HSLToRGB({h, s: 100, l: 50});
}

function parseColor(c) {
    return new Color(c);
}
Color.parseColor = parseColor;

function copyToColor(copyTo, copyFromIn) {
    var copyFrom = copyFromIn;
    //if (typeof color == "undefined") debugger;
    if (typeof copyFrom.type == "undefined" || copyFrom.type == "") {
        copyFrom = new Color(copyFromIn);
    }
    Object.assign(copyTo, copyFrom);
}

function copyProperties(copyTo, copyFrom, props) {
    for (var i = 0; i < props.length; i++) {
        copyTo[props[i]] = copyFrom[props[i]];
    }
}

function hashCodeToRGB(hash) {
    if (hash.length == 4) {
        hash = `#${hash.charAt(1)}${hash.charAt(1)}${hash.charAt(2)}${hash.charAt(2)}${hash.charAt(3)}${hash.charAt(3)}`
    }
    var r = parseInt(hash.substring(1, 3), 16);
    var g = parseInt(hash.substring(3, 5), 16);
    var b = parseInt(hash.substring(5, 7), 16);
    return [r, g, b];
}

const HSLToRGB = ({h, s, l}) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    //return {r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4))};
    return new Color(Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4)));
};
Color.HSLToRGB = HSLToRGB;

random.init(Color);

function chooseBetweenColors(...args) {
    function choose(options) {
        return options[Math.floor(Math.random()*options.length)];
    }

    var list = args;
    if (args[0] instanceof Array) list = args[0];
    return function(light) {
        return choose(list);
    }
}

function randomRGB() {
    return function(light) {
        return new Color(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255));
    }
}
Color.randomRGB = randomRGB;

function randomHSL() {
    return function() {
        return HSLToRGB({h: randLinear(0, 360), s: 100, l: 50});
    }
}
Color.randomHSL = randomHSL;

function randomInt(a, b) {
    var diff = b-a;
    return Math.round(Math.random()*diff+a);
}

function randLinear(a,b) {
    var diff = b-a;
    return Math.random()*diff+a;
}

Color.chooseBetweenColors = chooseBetweenColors;

function isColor(c) {
    if (typeof c == "undefined" || typeof c == "string" || typeof c.type === "undefined" || c.type == "") return false;
    if (c.type == "rgb") {
        return typeof c.r !== "undefined" && typeof c.g !== "undefined" && typeof c.b !== "undefined";
    }
    if (c.type == "function") {
        return typeof c.func !== "undefined";
    }
    if (c.type == "gradient") {
        return typeof c.gradient !== "undefined";
    }
    if (c.type == "colorspace") {
        return typeof c.colorspace !== "undefined";
    }
    return c instanceof Color;
}
Color.isColor = isColor;

module.exports = Color;

function importUserFuncs() {
    //var fileContents = fs.readFileSync("./colornames/userfuncs.js", {encoding:"utf8", flag:"r"});
    //(1, eval)(fileContents);
}

function createColorMapping(colorMapping) {
    return new ColorMapping(colorMapping);
}