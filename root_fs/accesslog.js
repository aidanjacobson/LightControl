var remote = require("./remote");
var fs = require("fs")

function middleware(req, res, next) {
    var entry = {
        time: Date.now(),
        method: req.method,
        path: req.path,
        body: req.body,
        origin_id: req.header("Origin-ID"),
        ip: req.clientIp
    }
    addEntryToLog(entry);
}

function addEntryToLog(entry) {
    if (!remote.isRemote()) return;
    if (!fs.existsSync("/data/log.json")) fs.writeFileSync("/data/log.json", "[]");

    var entries = JSON.parse(fs.readFileSync("/data/log.json"));
    entries.push(entry);
    fs.writeFileSync("/data/log.json", JSON.stringify(entries));
}

function getLog() {
    if (!fs.existsSync("/data/log.json")) return [];
    return JSON.parse(fs.readFileSync("/data/log.json"))
}

module.exports = {middleware, getLog};