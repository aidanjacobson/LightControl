const remote = require("./remote");

var manifest = require("./defaultmanifest.json");
function generate() {
    if (remote.isRemote()) {
        manifest.start_url = remote.server.getInterfaceURL();
        manifest.name = "LightControl"
    }
    return manifest;
}

module.exports = {generate};