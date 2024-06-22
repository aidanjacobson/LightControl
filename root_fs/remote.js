var fs = require("fs");

function isRemote() {
    return fs.existsSync("/data");
}

function getInterfaceURL() {
    server.host = isRemote() ? "aidanjacobson.duckdns.org" : "localhost";
    if (isRemote()) {
        server.http = false;
    } else {
        server.http = true;
    }
    var protocol = server.http ? "http" : "https";
    return `${protocol}://${server.host}:${server.port}/${server.ui}`;
}

var server = {getInterfaceURL, http:false, ui: ""};
module.exports = {isRemote, server};