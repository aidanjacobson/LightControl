const {def, ndef} = require("../def_ndef");
const getallcolornames = require("./getallcolornames");
const express = require("express")
var ConfigLoader = require("../node_configloader");
var options = {
    store: "savedcolorgroups"
}
var server = new ConfigLoader(options);

async function getAllGroupInfo() {
    var config = await server.downloadConfig();
    // return config.groups;
    return Object.keys(config.groups).map(key=>({
        id: key,
        name: config.groups[key].name
    }))
}

async function getAllColorsInGroup(groupID) {
    var config = await server.downloadConfig();
    if (ndef(config.groups[groupID])) return [];
    var group = config.groups[groupID];
    if (group.type == "list") return group.members;
    if (group.type == "auto") {
        var colornames = await getallcolornames(true);
        var regex = new RegExp(group.regex);
        return colornames.colors.filter(name=>regex.test(name));
    }
}

var groupRouter = express.Router();

groupRouter.get("/info", async function(req, res) {
    res.json(await getAllGroupInfo());
})

groupRouter.get("/colors/:groupID", async function(req, res) {
    res.json(await getAllColorsInGroup(req.params.groupID));
})

module.exports = {getAllGroupInfo, getAllColorsInGroup, groupRouter};