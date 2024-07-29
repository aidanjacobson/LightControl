process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

const {setAll, setLight} = require("./lightcommand/light");

const Color = require("./color");
const Gradient = require("./gradient");

const server = require("./server");

const ha = require("./lightcommand/homeassistant");

// cache group data
async function cacheGroups() {
    await ha.getGroup("light.house_lights");
    console.log("Groups cached");
}

async function main() {
    await cacheGroups();
}

main();