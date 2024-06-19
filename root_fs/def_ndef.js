function def(value) {
    return typeof value !== "undefined";
}

function ndef(value) {
    return !def(value);
}

module.exports = {def, ndef};