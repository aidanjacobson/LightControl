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
    return next();
}

var logPath = "/data/log.json";

if (!remote.isRemote()) {
    logPath = "log.json";
}

function addEntryToLog(entry) {
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "[]");

    var entries = JSON.parse(fs.readFileSync(logPath));
    entries.push(entry);
    fs.writeFileSync(logPath, JSON.stringify(entries));
}

function getLog() {
    if (!fs.existsSync(logPath)) return [];
    return JSON.parse(fs.readFileSync(logPath))
}

module.exports = {middleware, getLog};