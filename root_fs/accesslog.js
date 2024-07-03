var remote = require("./remote");
var fs = require("fs")

var doNotLog = ["/getcss"]
function middleware(req, res, next) {
    if (doNotLog.indexOf(req.path) > -1) {
        return next();
    }
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

const days_to_keep = 7;
function pruneLog(entries) {
    var millisDiff = days_to_keep*24*60*60*1000;
    var currentTime = Date.now();
    var earliestTime = currentTime - millisDiff;
    function entryIsWithinDays(entry) {
        if (!entry.time) return false;
        return entry.time >= earliestTime;
    }
    function entryPathIsGood(entry) {
        return doNotLog.indexOf(entry.path) == -1;
    }
    return entries.filter(entryIsWithinDays).filter(entryPathIsGood);
}

function addEntryToLog(entry) {
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "[]");

    var entries = JSON.parse(fs.readFileSync(logPath));
    entries.push(entry);
    entries = pruneLog(entries);
    fs.writeFileSync(logPath, JSON.stringify(entries));
}

function getLog() {
    if (!fs.existsSync(logPath)) return [];
    return JSON.parse(fs.readFileSync(logPath))
}

module.exports = {middleware, getLog};