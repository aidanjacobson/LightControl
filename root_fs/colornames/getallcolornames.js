var css = require("./csscolornames.json");
var customLoader = require("./colornames");
var external = require("./externalfiles");

async function getAllKeys(forceReload=false) {
    if (forceReload) {
        console.log("Begin force reload")
        await customLoader.loadColors();
        console.log("End force reload")
    }
    var out = {
        css: Object.keys(css),
        custom: Object.keys(customLoader.getColors()),
        external: Object.keys(external)
    };
    out.colors = consolidate(out);
    console.log("finished get colors")
    return out;
}

function consolidate(out) {
    return out.custom.concat(out.css.sort()).concat(out.external.sort()).filter((e,i,a)=>a.indexOf(e)==i);
}

module.exports = getAllKeys;