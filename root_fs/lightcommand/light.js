var fp = require("./floorplan"), floorplan = {};
const Color = require("../color");
const {def, ndef} = require("../def_ndef")
const imageURL = require("../imageurl");
const ha = require("./homeassistant");
const segment = require("./segmentedled");

// Keep track of what each light was last set to
var entityCachedColors = {};

// keep track of the lights set in the last call in order to turn off the unused segments of segmented_ledstrips
var lastLightsSet = [];

/**
 * Set a home assistant light to an rgb color.
 * @param {LightInfo} light lightinfo from floorplan
 * @param {Color} color color to set. Must be of type rgb
 * @param {boolean} [noscene=false] whether to use Home Assistant Scenes or a sequence of service calls. Defaults to scene=true
 */
function setLight(light, color, noscene=false) {
    if (segment.isSegment(light.entity)) {
        segment.setSegmentLight(light, color);
    }
    var lightEntity = light.entity;
    if (lightEntity.indexOf("light.") != 0 && lightEntity.indexOf("segment.") != 0) {
        lightEntity = `light.${lightEntity}`;
    }
    // console.log(`setlight ${light.entity}`);
    if (noscene) {
        var service = "light.turn_off"
        var data = {
            entity_id: lightEntity
        }
        if (color.r != 0 || color.g != 0 || color.b != 0) {
            service = "light.turn_on"
            data.rgbw_color = [color.r, color.g, color.b, 0]
        }
        ha.serviceCall(service, data);
    }
    // entityCachedColors[lightEntity] = color;
}

/**
 * Set all lights to a Color.
 * Functions, gradients, urls, mappings, etc. will be resolved to rgb colors at this stage based on reduction (e.g. gradient -> function -> rgb value)
 * @param {*} colorInput 
 * @param {*} options {
 *  noscene?: boolean,
 *  assumeMissingColors?: boolean,
 *  lights?: array
 * } 
 * @returns 
 */
async function setAll(colorInput, options={}) {
    var noscene = false;
    if (def(options.noscene)) noscene = options.noscene;
    var color = Color.from(colorInput);
    if (color.type == "gradient") {
        return await setAll(color.gradient.convertToColorCommandFunction(), options)
    }
    if (color.type == "colorspace") {
        return await setAll(color.colorSpace.convertToColorCommandFunction(), options);
    }
    if (color.type == "url") {
        return await setAll(await imageURL.fromURL(color), options);
    }
    if (color.type == "builder") {
        return await setAll(color.builder.convertToColorFunction(), options);
    }
    if (color.type == "buffer") {
        return await setAll(await imageURL.fromBuffer(color), options);
    }
    if (color.type == "radial") {
        return await setAll(color.radial.convertToColorCommandFunction(), options);
    }
    if (color.type == "colorMapping") {
        var assumeMissingColors = true;
        if (def(options.assumeMissingColors)) assumeMissingColors = options.assumeMissingColors;
        var previousModes = await segment.getAllSegmentedModes();
        await segment.setModesFromDeviceList(color.mapping.getLightNames());
        var outValue = await setAll(color.mapping.createRenderFunction(assumeMissingColors), options);
        await segment.setAllSegmentedModes(previousModes);
        return outValue;
    }
    if (color.type == "none") {
        return color;
    }

    await fp.updateFloorplan();
    floorplan = fp.getFloorplan();

    // console.log(color);
    lastLightsSet = [];

    // let segment.js expand segmented lights from the floorplan into individual lights
    // var lights = segment.expandLightList(floorplan);
    var lights = [];
    if (ndef(options.lights)) {
        lights = segment.expandLightList(floorplan);
    } else {
        var lightList = [];
        if (options.lights instanceof Array) {
            lightList = options.lights.map(l=>"light."+l);
        } else {
            lightList = ["light."+options.lights];
        }
        for (var i = 0; i < lightList.length; i++) {
            lightList[i] = await ha.getGroup(lightList[i]);
            lightList[i] = lightList[i].map(name=>name.split(".")[1])
        }
        lightList = lightList.flat();
        lights = segment.expandLightList(floorplan, lightList);
    }

    // lights = lights.sort((a,b)=>b.x-a.x)

    color.colorList = [];
    for (var i = 0; i < lights.length; i++) {
        var light = lights[i];
        var colorToSet = Color.from(color);
        // if (color.type == "function") {
            var skipThisLight = false;
        while (colorToSet.type == "function") {
            // if (light.entity == "lamp") debugger;
            var result = await colorToSet.func(light, floorplan);
            if (result == "donotchange") {
                skipThisLight = true;
                break;
            }
            //if (typeof result == "undefined") debugger;
            colorToSet = Color.from(result);
        }
        if (skipThisLight) continue;
        setLight(light, colorToSet, noscene);
        
        // if (color.colorList.every(newColor=>! (newColor.r == colorToSet.r && newColor.g == colorToSet.g && newColor.b == colorToSet.b))) {
        color.colorList.push(colorToSet);
        // }

        lastLightsSet.push(light.entity);
        entityCachedColors[light.entity] = colorToSet;
    }

    if (!noscene) applyHomeAssistantScene();
    
    await segment.turnOffUnusedSegments(lastLightsSet);
    
    const RGBToHSL = ({r, g, b}) => {
        var nr = r/255;
        var ng = g/255;
        var nb = b/255;
        var vmin = Math.min(nr, ng, nb),
            vmax = Math.max(nr, ng, nb),
            h, s, l = (vmax+vmin)/2;
        if (vmax === vmin) return [0, 0, l];
        const d = vmax - vmin;
        s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
        if (vmax === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
        if (vmax === ng) h = (nb - nr) / d + 2;
        if (vmax === nb) h = (nr - ng) / d + 4;
        h /= 6;
    
        return {h: h*360, s: s*100, l: l*100};
    }

    color.colorList = color.colorList.sort((a,b)=>RGBToHSL(a).h - RGBToHSL(b).h);
    // console.log(color.colorList.map(c=>c.toString()))
    return color;
}

async function getColorLightShouldBe(lightObj) {

}

async function evaluateColorOfLightAtPosition(lightObj, color) {

}

async function applyHomeAssistantScene() {
    floorplan = fp.getFloorplan();
    var data = {entities:{}};
    for (var i = 0; i < floorplan.lights.length; i++) {
        var entityName = floorplan.lights[i].entity;
        var color = entityCachedColors[entityName];
        if (!color) {
            continue;
        }
        if (entityName.indexOf("light.") != 0) entityName = "light." + entityName;
        var rgbw_color = [color.r, color.g, color.b, 0];
        var entityState = {state:"on",rgbw_color};
        if (rgbw_color[0] == 0 && rgbw_color[1] == 0 && rgbw_color[2] == 0) {
            entityState.state = "off";
        }
        data.entities[entityName] = entityState;
    }
    await ha.serviceCall("scene.apply", data);
}

async function generateSaveColorsString(nocache=false) {
    if (nocache) {
        await pullCurrentColors();
    }
    var colorMap = {};
    lastLightsSet.forEach(function(light) {
        colorMap[light] = entityCachedColors[light].toString();
    });
    return JSON.stringify(colorMap);
}

function getLastLightData() {
    return {
        lightsSet: lastLightsSet,
        cachedColors: entityCachedColors
    }
}

function getLightColor(entity) {
    // if (segment.isSegment(entity)) {
    //     if (entityCachedColors[entity]) return entityCachedColors[entity];
    //     if (segment.)
    // }
    if (entity.indexOf("light.") != 0 && entity.indexOf("segment.") != 0) entity = `light.${entity}`;
    return entityCachedColors[entity];
}

async function pullCurrentColors() {
    floorplan = fp.getFloorplan();
    var promises = floorplan.lights.map(function(light) {
        return pullColor(light.entity);
    });
    var colors = await Promise.allSettled(promises);
    for (var i = 0; i < floorplan.lights.length; i++) {
        var entity = floorplan.lights[i].entity;
        var [r, g, b] = colors[i].value;
        entityCachedColors[entity] = new Color({r, g, b});
    }
}

async function pullColor(light) {
    lightEntity = light;
    if (light.indexOf("light.") == -1) {
        lightEntity = "light." + lightEntity;
    }
    var response = await ha.get(`/states/${lightEntity}`);
    if (ndef(response.attributes) || ndef(response.attributes.rgb_color)) debugger;
    rgb_color = response.attributes.rgb_color;
    if (rgb_color == null) {
        rgb_color = [0,0,0];
    }
    return rgb_color;
}

module.exports = {setLight, setAll, getLightColor, generateSaveColorsString, pullColor, pullCurrentColors, getLastLightData};