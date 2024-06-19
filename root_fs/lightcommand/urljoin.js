function urlJoin(base, ...arguments) {
    return removeSlashEnds(base) + "/" + arguments.map(removeSlashEnds).join("/");
}

function removeSlashEnds(string) {
    var out = string;
    if (out[0] == "/") out = out.substring(1, out.length);
    if (out[out.length-1] == "/") out = out.substring(0, out.length-1);
    return out;
}

module.exports = urlJoin;