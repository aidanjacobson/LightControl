var ConfigLoader = require("../node_configloader");

// Create ConfigLoader for floorplan config
var options = {
    store: "floorplan"
}
var server = new ConfigLoader(options);

// floorplan will be requested a lot in short periods of time, don't redownload unless it has been at least 5 seconds since the last request
var lastFloorplanTime = 0;
var lastFloorplan;

/**
 * Request an updated floorplan. This function has a 5 second cooldown period to save resources
 * @returns The floorplan config object documented in floorplan_config.txt
 */
async function updateFloorplan() {
    if (Date.now() - lastFloorplanTime < 5000) return lastFloorplan;

    // download floorplan from config server
    var floorplan = await server.downloadConfig();
    if (typeof floorplan == "undefined") return lastFloorplan; // why wouldn't floorplan be defined??? remove this after figuring out why

    // sort the lights based on x position, and also move slower ones to end of list for smoother update order.
    // This isn't documented in the config because it's probably shitty code.
    floorplan.lights = sortFloorplanLights(floorplan);
    lastFloorplanTime = Date.now();
    lastFloorplan = floorplan;
}


/**
 * 
 * @param {Floorplan} floorplan - floorplan object containing lights array to be sorted.
 * @returns {Array<LightInfo>} the sorted lights array
 */
function sortFloorplanLights(floorplan) {
    var out = floorplan.lights.sort((a,b)=>a.x-b.x);
    // var unmoved = out.filter(light=>floorplan.slowest.indexOf(light.entity) == -1);
    // var moved = out.filter(light=>floorplan.slowest.indexOf(light.entity) > -1);
    // out = unmoved.concat(moved);
    return out;
}

/**
 * Get the last floorplan downloaded without requesting refresh of floorplan.
 * @returns {Floorplan} Floorplan
 */
function getFloorplan() {
    //console.log("return", lastFloorplan);
    return lastFloorplan;
}

// pull floorplan on first load
updateFloorplan();

async function setFloorplan(floorplan) {
    lastFloorplan = server.config = floorplan;
    await server.uploadConfig();
}

async function getAllEntityOptions() {
    await updateFloorplan();
    var entities = getAllEntities();
    var segments = getAllSegments();
    var nonsegmented = getAllNonSegmented();
    var groups = getAllGroups();
    var allEntityOptions = {
        all: [...entities, ...segments, ...groups],
        entities,
        nonsegmented,
        segments,
        groups
    }
    return allEntityOptions;
}

function getAllNonSegmented() {
    var entities = getAllEntities();
    return entities.filter(entityInfo=>! (entityInfo.entity in lastFloorplan.segmented_led));
}

function getAllEntities() {
    return lastFloorplan.lights.map(light=>({entity: light.entity, friendlyName: light.friendlyName}));
}

function getLightFriendlyName(id) {
    var light = lastFloorplan.lights.find(light=>light.entity==id);
    if (!light || !light.friendlyName) return "";
    return light.friendlyName;
}

function getAllSegments() {
    var out = [];
    for (var entityID in lastFloorplan.segmented_led) {
        var friendlyName = getLightFriendlyName(entityID);
        var segmentData = lastFloorplan.segmented_led[entityID];
        for (var group of segmentData.groups) {
            out.push({
                entity: `segment.${entityID}.${group.name}`,
                friendlyName: `Segment group ${group.name} of ${friendlyName}`
            })
        }
        for (var i = 0; i < segmentData.segments; i++) {
            out.push({
                entity: `segment.${entityID}.${i}`,
                friendlyName: `Segment number ${i} of ${friendlyName}`
            })
        }
    }
    return out;
}

function getAllGroups() {
    return lastFloorplan.groups.slice();
}

module.exports = {getFloorplan, updateFloorplan, setFloorplan, getAllEntityOptions};