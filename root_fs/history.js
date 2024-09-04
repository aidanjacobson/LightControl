const express = require("express");

var historyEntries = [];
var forwardEntries = [];

function addToHistory(entry) {
    historyEntries.push(entry);
    forwardEntries = [];
}

function historyBack() {
    if (historyEntries.length < 2) return false;
    forwardEntries.push(historyEntries.pop());
    return true;
}

function historyForward() {
    if (forwardEntries.length == 0) return false;
    historyEntries.push(forwardEntries.pop());
    return true;
}

function createHistoryCurrentFunction() {
    return historyEntries[historyEntries.length-1];
}

function createHistoryBackFunction() {
    var success = historyBack();
    if (!success) return "none";
    return historyEntries[historyEntries.length-1];
}

function createHistoryForwardFunction() {
    var success = historyForward();
    if (!success) return "none";
    return historyEntries[historyEntries.length-1];
}

var lastDetails = {};
function saveLastCommand(commandString) {
    lastDetails.command = commandString;
}

function saveLastCSS(css) {
    lastDetails.css = css;
}

function saveLastColorMapping(mapping) {
    lastDetails.mapping = mapping;
} 

function getLastCommand() {
    return lastDetails.command;
}

function getLastCSS() {
    return lastDetails.css;
}

function getLastColorMapping() {
    return lastDetails.mapping;
}

const lastRouter = express.Router();

lastRouter.get("/css", function(req, res) {
    res.json({css: getLastCSS()});
});

lastRouter.get("/command", function(req, res) {
    res.json({command: getLastCommand()});
});

lastRouter.get("/mapping", function(req, res) {
    res.json({mapping: getLastColorMapping()});
});

var last = {
    mapping: {
        get: getLastColorMapping,
        set: saveLastColorMapping
    },
    command: {
        get: getLastCommand,
        set: saveLastCommand
    },
    css: {
        get: getLastCSS,
        set: saveLastCSS
    },
    router: lastRouter
}


module.exports = {addToHistory, back: createHistoryBackFunction, forward: createHistoryForwardFunction, current: createHistoryCurrentFunction, last};