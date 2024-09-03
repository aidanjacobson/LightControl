const settings = require("./settings");
const Color = require("./color")

function scaleBetweenColors(x, low, high, color1, color2) {
    var percent = (x-low)/(high-low);
    return getColorInterpolation(percent, color1, color2);
}

function getColorInterpolation(...args) {
    var mode = settings.getSettingSync("colorLinearInterpolationMode");
    if (mode == "linearScale") {
        return getPercentBetweenColors(...args)
    }
    if (mode == "square") {
        return getPercentBetweenColorsSquared(...args);
    }
}


function getPercentBetweenColors(percent, color1, color2) {
    var newColor1, newColor2;
    newColor1 = color1;
    newColor2 = color2;
    var newR = scale(percent, 0, 1, newColor1.r, newColor2.r);
    var newG = scale(percent, 0, 1, newColor1.g, newColor2.g);
    var newB = scale(percent, 0, 1, newColor1.b, newColor2.b);
    return new Color(newR, newG, newB);
}

function squareColor({r, g, b}) {
    scaled_r = r / 255;
    scaled_g = g / 255;
    scaled_b = b / 255;
    new_scaled_r = Math.pow(scaled_r, 2);
    new_scaled_g = Math.pow(scaled_g, 2);
    new_scaled_b = Math.pow(scaled_b, 2);
    var new_r = new_scaled_r * 255;
    var new_g = new_scaled_g * 255;
    var new_b = new_scaled_b * 255;
    return new Color({r: new_r, g: new_g, b: new_b});
}

function getPercentBetweenColorsSquared(percent, color1, color2) {
    const newColor1 = squareColor(color1);
    const newColor2 = squareColor(color2);
    const newR = scale(percent, 0, 1, newColor1.r, newColor2.r);
    const newG = scale(percent, 0, 1, newColor1.g, newColor2.g);
    const newB = scale(percent, 0, 1, newColor1.b, newColor2.b);
    return new Color(newR, newG, newB);
}

function scale(x, low, high, newLow, newHigh) {
    var percent = (x-low)/(high-low);
    return newLow + (newHigh-newLow)*percent;
}

module.exports = {getColorInterpolation, scaleBetweenColors, getPercentBetweenColors, getPercentBetweenColorsSquared}