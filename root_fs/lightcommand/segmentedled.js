require("dotenv").config();
const request = require("request");
const ha = require("./homeassistant")
const fp = require("./floorplan");
const stripModeLoader = require("../settings");

var strip_modes = {};

async function downloadStripModes() {
    // strip_modes = await stripModeLoader.downloadConfig();
    // await stripModeLoader.downloadConfig();
    strip_modes = await stripModeLoader.getSetting("strip_modes");
    var segmented = await getSegmentedLights();
    for (lightName of segmented) {
        if (! (lightName in strip_modes)) strip_modes[lightName] = "one_segment";
    }
}
downloadStripModes();


async function getSegmentedLights() {
    await fp.updateFloorplan();
    floorplan = fp.getFloorplan();
    return Object.keys(floorplan.segmented_led)
}

async function setSegmentedMode(lightName, mode) {
    await downloadStripModes();
    strip_modes[lightName] = mode;
    await stripModeLoader.uploadConfig();
}

async function getSegmentedMode(lightName) {
    await downloadStripModes();
    if (! (lightName in strip_modes)) return "one_segment";
    return strip_modes[lightName];
}

async function getAllSegmentedModes() {
    var modesOut = {};
    await downloadStripModes();
    Object.assign(modesOut, strip_modes);
    return modesOut;
}

async function setAllSegmentedModes(modes) {
    await downloadStripModes();
    Object.assign(strip_modes, modes);
    await stripModeLoader.uploadConfig();
}

var groupRegex = /^segment\.([^\.]+)\.([^\.]+)$/;

function getAvailableStripModes(lightName) {
    if (! (lightName in strip_modes))  {
        return [];
    }
    floorplan = fp.getFloorplan();
    var modes = floorplan.segmented_led[lightName].breakdowns.map(g=>g.name);
    if (modes.indexOf("one_segment") == -1) modes.push("one_segment");
    return modes;
}

var floorplan = fp.getFloorplan();
function expandLightListWithModes(_floorplan, lightList=_floorplan.lights.map(l=>l.entity), modes=strip_modes) {
    floorplan = _floorplan;

    var lightListOut = [];
    for (var i = 0; i < lightList.length; i++) {
        if (lightList[i].indexOf("segment.") == 0) {
            var [_, entityName, segmentName] = lightList[i].split(".");
            var light = floorplan.lights.find(lightInfo=>lightInfo.entity==entityName);
            var expandedLight = getExpandedLightForGroup(segmentName, light);
            lightListOut.push(expandedLight);
        }
    }
    for (var i = 0; i < floorplan.lights.length; i++) {
        var light = floorplan.lights[i];
        if (lightList.indexOf(light.entity) == -1) continue;

        if (! lightHasModeBreakdown(light.entity)) {
            lightListOut.push(light);
            continue;
        }

        var groups = getBreakdownGroups(light.entity, modes[light.entity]);
        for (var j = 0; j < groups.length; j++) {
            var expandedLight = getExpandedLightForGroup(groups[j], light);
            lightListOut.push(expandedLight);
        }
    }
    return lightListOut;
}

function expandLightList(_floorplan, lightList=_floorplan.lights.map(l=>l.entity)) {
    return expandLightListWithModes(_floorplan, lightList, strip_modes)
}

function getExpandedLightForGroup(groupName, masterLightInfo) {
    if (groupName == "one_segment") {
        return masterLightInfo;
    }
    var groupInfo;
    if (isNaN(groupName)) {
        for (var i = 0; i < floorplan.segmented_led[masterLightInfo.entity].groups.length; i++) {
            var info = floorplan.segmented_led[masterLightInfo.entity].groups[i];
            if (info.name == groupName) groupInfo = info;
        }
    } else {
        groupInfo = {
            name: groupName,
            offset: [0, 0]
        }
    }

    if (typeof groupInfo === "undefined") return [];

    return {
        entity: `segment.${masterLightInfo.entity}.${groupInfo.name}`,
        x: masterLightInfo.x + groupInfo.offset[0],
        y: masterLightInfo.y + groupInfo.offset[1]
    }
}

function getBreakdownGroups(entityName, breakdownName) {
    if (breakdownName == "one_segment") {
        return ["one_segment"];
    }
    for (var i = 0; i < floorplan.segmented_led[entityName].breakdowns.length; i++) {
        var breakdown = floorplan.segmented_led[entityName].breakdowns[i];
        if (breakdown.name == breakdownName) return breakdown.groups;
    }
    debugger;
    return [];
}

function lightHasModeBreakdown(name) {
    return name in strip_modes && strip_modes[name] != "one_segment";
}

async function turnOffUnusedSegments(usedLights) {
    var segmentedLights = Object.keys(strip_modes);
    for (var i = 0; i < segmentedLights.length; i++) {
        if (strip_modes[segmentedLights[i]] == "one_segment") continue;
        var segmentData = floorplan.segmented_led[segmentedLights[i]];
        var offSegments = [];
        for (var j = 0; j < segmentData.segments; j++) {
            if (! segmentIsUsed(j, segmentedLights[i], usedLights)) {
                offSegments.push(j);
            }
        }
        // console.log(offSegments);
        if (offSegments.length == 0) continue;
        setSegmentLight({entity: `segment.${segmentedLights[i]}.[${offSegments.join(",")}]`}, {r:0,g:0,b:0});
    }
}

function segmentIsUsed(segmentNumber, lightName, usedLights) {
    if (usedLights.indexOf(`segment.${lightName}.${segmentNumber}`) > -1) return true;
    for (var i = 0; i < floorplan.segmented_led[lightName].groups.length; i++) {
        var group = floorplan.segmented_led[lightName].groups[i];
        if (usedLights.indexOf(`segment.${lightName}.${group.name}`) > -1) {
            if (group.segments.indexOf(segmentNumber) > -1) return true;
        }
    }
    return false;
}

function isSegment(lightName) {
    return lightName.indexOf("segment.") == 0;
}

/**
 * 
 * @param {*} segmentEntityName ex. segment.bed_light_strip.quarter_1
 * @param {*} mainEntityName ex. light.bed_light_strip
 */
function isSegmentOf(segmentEntityName, mainEntityName) {
    if (!isSegment(segmentEntityName)) return false;
    if (isSegment(mainEntityName)) return false;
    var segEntity = segmentEntityName.split(".")[1];
    var mainEntity = mainEntityName.split(".")[1];
    return segEntity == mainEntity;
}

async function setSegmentLight(light, color) {
    var [_, lightName, groupName] = light.entity.split(".");
    if (floorplan.segmented_led[lightName].model == "Govee H619Z") return await setH619ZLight(light, color);
    if (floorplan.segmented_led[lightName].model == "hass_group") return await setHassGroupLight(light, color);
}

function setH619ZLight(light, color) {
    function getH619ZIdentifiers(lightName) {
        return floorplan.segmented_led[lightName].identifiers;
    }
    var [_, lightName, groupName] = light.entity.split(".");
    var segments = getSegmentsFromGroupName(groupName, lightName);
    var postData = {
        requestId: randomRequestID().toString(),
        payload: {
            ...getH619ZIdentifiers(lightName),
            capability: {
                type: "devices.capabilities.segment_color_setting",
                instance: "segmentedColorRgb",
                value: {
                    segment: segments,
                    rgb: convertColorToDecimal(color)
                }
            }
        }
    };
    var url = "https://openapi.api.govee.com/router/api/v1/device/control";
    var options = {
        url: url,
        json: postData,
        headers: {
            "Content-Type": "application/json",
            "Govee-API-Key": process.env.govee_api_key
        }
    }
    return postAsync(options);
}

async function setHassGroupLight(light, color) {
    var [_, lightName, groupName] = light.entity.split(".");
    var segments = getSegmentsFromGroupName(groupName, lightName);
    if (typeof segments === "undefined") {
        debugger;
        return;
    }
    // return await setRawHassLight({entity}, color);
    return await Promise.allSettled(segments.map(segment=>setRawHassLight({entity: getHassGroupSegmentEntity(lightName, segment)}, color)));
}

function getHassGroupSegmentEntity(lightName, segment) {
    return floorplan.segmented_led[lightName].segment_mappings[segment];
}

function convertColorToDecimal({r, g, b}) {
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | ((b & 0xFF) << 0);
}

var lastID = 0;
function randomRequestID() {
    return lastID++;
}

function getSegmentsFromGroupName(groupName, entityName) {
    if (! isNaN(groupName)) {
        return [Number(groupName)];
    }
    if (/^\[[0-9, ]+\]$/.test(groupName)) {
        return eval(groupName);
    }
    for (var i = 0; i < floorplan.segmented_led[entityName].groups.length; i++) {
        var group = floorplan.segmented_led[entityName].groups[i];
        if (group.name == groupName) {
            return group.segments;
        }
    }
    return [];
}

function postAsync(options) {
    return new Promise((resolve, reject) => {
        request.post(options, ()=>{
            resolve()
        });
    })
}

async function setModesFromDeviceList(deviceList) {
    var floorplan = fp.getFloorplan();
    var segmentDevices = deviceList.filter(device=>device.startsWith("segment."));
    var haveGroups = {};
    for (var device in floorplan.segmented_led) {
        haveGroups[device] = [];
    }
    for (var device of segmentDevices) {
        var matches = groupRegex.exec(device);
        var deviceName = matches[1];
        var groupName = matches[2];
        if (!haveGroups[deviceName]) haveGroups[deviceName] = [];
        haveGroups[deviceName].push(groupName);
    }

    for (var deviceName in haveGroups) {
        var breakdowns = floorplan.segmented_led[deviceName].breakdowns;
        var found = false;
        for (var breakdown of breakdowns) {
            if (breakdown.groups.every(group=>haveGroups[deviceName].indexOf(group.toString())>-1)) {
                await setSegmentedMode(deviceName, breakdown.name);
                found = true;
                break;
            }
        }
        if (!found) await setSegmentedMode(deviceName, "one_segment");
    }
}

function setRawHassLight(light, color) {
    if (light.entity.indexOf("light.") != 0 && light.entity.indexOf("segment.") != 0) {
        light.entity = `light.${light.entity}`;
    }
    // console.log(`setlight ${light.entity}`);
    var service = "light.turn_off"
    var data = {
        entity_id: light.entity
    }
    if (color.r != 0 || color.g != 0 || color.b != 0) {
        service = "light.turn_on"
        data.rgbw_color = [color.r, color.g, color.b, 0]
    }
    ha.serviceCall(service, data);
}


module.exports = {expandLightList, expandLightListWithModes, turnOffUnusedSegments, isSegment, isSegmentOf, setAllSegmentedModes, setModesFromDeviceList, getAllSegmentedModes, getSegmentedMode, setSegmentLight, getAvailableStripModes, getSegmentedLights, setSegmentedMode}