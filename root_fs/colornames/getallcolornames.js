var css = require("./csscolornames.json");
var customLoader = require("./colornames");
var external = require("./externalfiles");

async function getAllKeys(forceReload=false) {
    if (forceReload) await customLoader.loadColors();
    var out = {
        css: Object.keys(css),
        custom: Object.keys(customLoader.getColors()),
        external: Object.keys(external)
    };
    out.colors = consolidate(out);
    return out;
}

function consolidate(out) {
    return out.custom.concat(out.css.sort()).concat(out.external.sort()).filter((e,i,a)=>a.indexOf(e)==i);
}

module.exports = getAllKeys;