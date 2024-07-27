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

module.exports = {addToHistory, back: createHistoryBackFunction, forward: createHistoryForwardFunction, current: createHistoryCurrentFunction};