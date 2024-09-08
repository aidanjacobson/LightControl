const ha = require("./lightcommand/homeassistant");
const segment = require("./lightcommand/segmentedled");

/*
    layer {
        lights: String|Array<String>
        color: String|Color
    }

    Layers should be ordered from least important to most important.
*/

class AreaBuilder {
    layers=[]
    defaultColor = "donotchange"
    constructor(layers=[], defaultColor="donotchange") {
        this.layers = processLayers(layers);
        // this.layers = layers;
        this.defaultColor = defaultColor;
    }

    async findLayerWithEntity(entityName) {
        for (var i = this.layers.length-1; i >= 0; i--) {
            var checkingLayer = this.layers[i];
            if (await this.layerLightsContainLight(checkingLayer.lights, entityName)) {
                return checkingLayer;
            }
        }
        return null;
    }

    /**
     * 
     * @param {*} lights 
     * @param {*} lookingForLight MUST be in light.entity or segment.entity.name format
     */
    async layerLightsContainLight(lights, lookingForLight) {
        var lightArray = [];
        if (lights instanceof Array) {
            lightArray = lights;
        } else {
            lightArray = [lights];
        }
        for (var i = 0; i < lightArray.length; i++) {
            if (lightArray[i].indexOf("light.") == -1 && lightArray[i].indexOf("segment.") == -1) lightArray[i] = "light." + lightArray[i];
            lightArray[i] = await ha.getGroup(lightArray[i]);
        }
        lightArray = lightArray.flat();

        for (var i = 0; i < lightArray.length; i++) {
            var checkingAgainst = lightArray[i];
            if (checkingAgainst == lookingForLight || segment.isSegmentOf(lookingForLight, checkingAgainst)) {
                return true;
            }
        }
        return false;
    }

    convertToColorFunction() {
        var _this = this;
        return async function(lightObj) {
            var entityName = lightObj.entity;
            if (entityName.indexOf("light.") == -1 && entityName.indexOf("segment.") == -1) {
                entityName = "light." + entityName;
            }
            var layer = await _this.findLayerWithEntity(entityName);
            if (layer == null) {
                return _this.defaultColor;
            } else {
                return layer.color;
            }
        }
    }
}

function processLayers(layers) {
    var layersOut = [];

    for (var layer of layers) {
        if (layer.lights.indexOf(",") == -1) {
            layersOut.push(layer);
        } else {
            layerEntities = layer.lights.replaceAll(" ", "").split(",");
            for (var newEntity of layerEntities) {
                layersOut.push({lights: newEntity, color: layer.color});
            }
        }
    }

    return layersOut;
}

module.exports = AreaBuilder;