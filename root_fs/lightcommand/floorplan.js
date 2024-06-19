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
    var unmoved = out.filter(light=>floorplan.slowest.indexOf(light.entity) == -1);
    var moved = out.filter(light=>floorplan.slowest.indexOf(light.entity) > -1);
    out = unmoved.concat(moved);
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

module.exports = {getFloorplan, updateFloorplan};