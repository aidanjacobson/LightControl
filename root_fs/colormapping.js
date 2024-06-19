class ColorMapping {
    colorMapping = {};
    keys=[];
    constructor(colorMapping) {
        this.colorMapping = colorMapping;
        this.keys = Object.keys(this.colorMapping);
    }

    findColorWithEntity(entity) {
        if (!entity.startsWith("light.") && !entity.startsWith("segment.")) {
            entity = "light." + entity;
        }
        // console.log(entity);
        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i] == entity) {
                return this.colorMapping[this.keys[i]];
            }
        }
    }
    createRenderFunction() {
        var _this = this;
        return function(light) {
            return _this.findColorWithEntity(light.entity);
        }
    }

    getLightNames() {
        return this.keys;
    }
}

module.exports = ColorMapping;