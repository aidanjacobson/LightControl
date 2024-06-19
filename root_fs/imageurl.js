const getPixels = require("get-pixels");
const Color = require("./color");
const { def } = require("./def_ndef");
const utils = require("./utils");

async function fromURL(color) {
    var url = color.url;
    var pixels = await asyncPixels(url);
    // console.log(pixels);
    return function(light, floorplan) {
        var x = Math.floor(utils.scale(light.x, 0, floorplan.width, 0, pixels.shape[0]));
        var y = Math.floor(utils.scale(light.y, 0, floorplan.height, 0, pixels.shape[1]));
        if (x >= pixels.shape[0]) x = pixels.shape[0]-1;
        if (y >= pixels.shape[1]) y = pixels.shape[1]-1;
        //console.log(light.entity);
        var output = getPixelAtPoint(pixels, x, y);
        //console.log(output);
        return output;
    }
}

async function fromBuffer(color) {
    var buffer = color.buffer;
    var mime = color.mimeType;
    var pixels = await asyncPixels(buffer, mime);
    // console.log(pixels);
    return function(light, floorplan) {
        var x = Math.floor(utils.scale(light.x, 0, floorplan.width, 0, pixels.shape[0]));
        var y = Math.floor(utils.scale(light.y, 0, floorplan.height, 0, pixels.shape[1]));
        if (x >= pixels.shape[0]) x = pixels.shape[0]-1;
        if (y >= pixels.shape[1]) y = pixels.shape[1]-1;
        //console.log(light.entity);
        var output = getPixelAtPoint(pixels, x, y);
        //console.log(output);
        return output;
    }
}

function getPixelAtPoint(data, x, y) {
    var index = (y*data.shape[0]+x) * data.shape[2];
    var r = data.data[index+0];
    var g = data.data[index+1];
    var b = data.data[index+2];
    //console.log(x, y, index, r, g, b);
    return new Color([r, g, b]);
}

function asyncPixels(url, mime) {
    if (def(mime)) {
        return new Promise((resolve, reject) => {
            getPixels(url, mime, function(err, pixels) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(pixels);
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            getPixels(url, function(err, pixels) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(pixels);
            })
        })
    }
}

module.exports = {fromURL, fromBuffer};