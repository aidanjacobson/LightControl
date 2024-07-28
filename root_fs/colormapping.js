const fp = require("./lightcommand/floorplan");
var floorplan = fp.getFloorplan();

class ColorMapping {
    colorMapping = {};
    keys=[];
    constructor(colorMapping) {
        this.colorMapping = colorMapping;
        this.keys = Object.keys(this.colorMapping);
    }

    findColorWithEntity(lightObj) {
        var entity = lightObj.entity;
        if (!entity.startsWith("light.") && !entity.startsWith("segment.")) {
            entity = "light." + entity;
        }
        // console.log(entity);
        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i] == entity) {
                return this.colorMapping[this.keys[i]];
            }
        }

        // if not found, find the closest set light
        return this.findColorWithEntity(this.getClosestPositionedLight(lightObj));
    }
    createRenderFunction() {
        var _this = this;
        return function(lightObj) {
            return _this.findColorWithEntity(lightObj);
        }
    }

    getLightNames() {
        return this.keys;
    }

    getClosestPositionedLight(lightObject) {
        floorplan = fp.getFloorplan();
        var minDistance = Infinity;
        var minLightObj;
        var dist;
        for (var compareLightObj of floorplan.lights) {
            if (this.entityIsInMapping(compareLightObj.entity) && (dist = dist_light(lightObject, compareLightObj)) < minDistance) {
                minLightObj = compareLightObj;
                minDistance = dist;
            }
        }
        return minLightObj;
    }

    entityIsInMapping(entityName) {
        var names = this.getLightNames();
        return names.indexOf(entityName) > -1 || names.indexOf("light."+entityName) > -1;
    }
}

function dist_light(light1, light2) {
    return Math.sqrt(Math.pow(light1.x-light2.x, 2) + Math.pow(light1.y-light2.y, 2));
}

module.exports = ColorMapping;