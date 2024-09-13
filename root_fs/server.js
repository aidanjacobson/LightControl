const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const light = require("./lightcommand/light");
const history = require("./history");
const Color = require("./color");
const colorsaveutils = require("./colorsaveutils");
const {def, ndef} = require("./def_ndef");
const getAllColorNames = require("./colornames/getallcolornames")
const fp = require("./lightcommand/floorplan");
const remote = require("./remote");
const manifest = require("./manifest");
const unless = require("./unless")
const accesslog = require("./accesslog")
const settingsLoader = require("./settings");
const ai_control = require("./ai/ai_control");
const addon = require("./supervisor_utils")

var requestIp = require("request-ip");
const storage = multer.memoryStorage();
const upload = multer({storage});
var allColors;

const segment = require("./lightcommand/segmentedled");

var app = express();
app.use(express.json());
app.use(cors());
app.use(requestIp.mw());
app.use("/ui", express.static(path.join(__dirname, "ui")));

require("dotenv").config();

const port = 9168;
const host = '0.0.0.0';

var server;
if (remote.isRemote()) {
    var privateKey = fs.readFileSync("/ssl/privkey.pem");
    var certificate = fs.readFileSync("/ssl/fullchain.pem");
    var credentials = {key:privateKey,cert:certificate};
    server = https.createServer(credentials, app)
} else {
    server = http.createServer(app);
}

server.listen(port, host, ()=>{
    console.log("Server running on port " + port);
    remote.server.port = port;
    remote.server.ui = "ui";
    var url = remote.server.getInterfaceURL();
    console.log("UI available at", url);
});

function authMiddleware(req, res, next) {
    var securityKey = req.header("Security-key");
    if (securityKey == process.env.lightcontrol_access_token) {
        next();
    } else {
        res.status(401).send("missing or incorrect header Security-key");
    }
}

var ignorePaths = ["/ui", "/getmanifest", "/getlog", "/favicon.ico"]

app.use(unless(authMiddleware, "/ui", ...ignorePaths))
app.use(unless(accesslog.middleware, "/ui", ...ignorePaths));

app.get("/getlog", function(req, res) {
    res.json(accesslog.getLog());
})

app.post("/sendImage", upload.single("image"), async function(req, res) {
    await doSetAll(req.file, res);
})

app.post("/sendImageNoScene", upload.single("image"), async function(req, res) {
    await doSetAll(req.file, res, {noscene:true});
})

app.post("/setAllNoScene", async function(req, res) {
    var options = {noscene:true}
    Object.assign(options, req.body.options);
    await doSetAll(req.body.color, res, options);
})

app.get("/setAllNoScene/:query", async function(req, res) {
    var options = {noscene: true};
    Object.assign(options, req.body.options);
    await doSetAll(decodeURI(req.params.query), res, options);
})

app.post("/setAll", async function(req, res) {
    var options = {noscene: false};
    Object.assign(options, req.body.options);
    await doSetAll(req.body.color, res, options);
});

app.get("/setAll/:query", async function(req, res) {
    var options = {noscene: false};
    Object.assign(options, req.body.options);
    await doSetAll(decodeURI(req.params.query), res, options);
})

app.get("/getAvailableStripModes/:lightName", function(req, res) {
    res.json(segment.getAvailableStripModes(req.params.lightName));
})

app.get("/getSegmentedLights", async function(req, res) {
    res.json(await segment.getSegmentedLights());
})

app.get("/setSegmentedMode/:lightName/:modeName", async function(req, res) {
    await segment.setSegmentedMode(req.params.lightName, req.params.modeName);
    res.json({status:"success"});
})

app.get("/getSegmentedMode/:lightName", async function(req, res) {
    res.json(await segment.getSegmentedMode(req.params.lightName));
})

app.get("/getAllSegmentedModes", async function(req, res) {
    res.json(await segment.getAllSegmentedModes());
})

app.post("/setLight", function(req, res) {
    doSetLight(req.body.light, req.body.color)
});

app.get("/setLight/:light/:query", function(req, res) {
    doSetAll(decodeURI(req.params.light), decodeURI(req.params.query), res);
})

app.get("/getmanifest", function(req, res) {
    res.json(manifest.generate());
})

app.get("/getcolors", async function(req, res) {
    allColors = await getAllColorNames(true);
    res.json(allColors);
})

app.post("/getcss", function(req, res) {
    var query = [];
    if (req.body.color instanceof Array) {
        query = req.body.color;
    } else {
        query[0] = req.body.color;
    }
    var out = query.map(q=>Color.from(q).toCSS());
    if (!(req.body.color instanceof Array)) out = out[0];
    res.json({css:out});
})

app.post("/parsecolor", function(req, res) {
    var color = Color.from(req.body.color);
    if (color.type == "rgb") {
        res.json({status:"success", color: {r: color.r, g: color.g, b: color.b}});
    } else {
        res.json({status:"failure",reason:"color did not return rgb format",code:"ERR_NOT_RGB"});
    }
});


app.get("/", function(req, res) {
    res.redirect("ui/")
});


app.post("/saveColor", async function(req, res) {
    await colorsaveutils.saveColor(req.body.color, req.body.name);
    allColors = await getAllColorNames();
    res.json({status:"success"});
})

app.post("/saveColorScene", async function(req, res) {
    nocache = false;
    if (def(req.body.nocache)) {
        nocache = req.body.nocache;
    }
    await colorsaveutils.saveColorScene(req.body.name, nocache);
    allColors = await getAllColorNames();
    res.json({status:"success"});
})

app.get("/updateColors", async function(req, res) {
    await fp.updateFloorplan();
    res.json({status: "success"});
})

app.get("/testlogin", function(req, res) {
    res.json({status:"success"});
})

app.get("/getFloorplan", function(req, res) {
    res.json(fp.getFloorplan());
})

app.post("/setFloorplan", async function(req, res) {
    var newFloorplan = req.body;
    await fp.setFloorplan(newFloorplan);
    res.json({status: "success"});
})

app.get("/getLastLightData", async function(req, res) {
    res.json(light.getLastLightData());
})

app.get("/getLightEntityColor/:entity", async function(req, res) {
    var lastLightData = light.getLastLightData();
    res.json(lastLightData.cachedColors[req.params.entity]);
})

app.post("/expandLightListWithModes", async function(req, res) {
    res.json(segment.expandLightListWithModes(fp.getFloorplan(), req.body.lightList, req.body.modes));
})

app.post("/getSetting", async function(req, res) {
    res.json(await settingsLoader.getSetting(req.body.setting));
})

app.post("/setSetting", async function(req, res) {
    await settingsLoader.setSetting(req.body.setting, req.body.value);
    res.json({status: "success"});
})

app.post("/promptAI", async function(req, res) {
    var response = await ai_control.generateColorFromUserPrompt(req.body.prompt);
    res.json(response);
})

app.use("/history/last", history.last.router);

app.post("/rebuild", async function(req, res) {
    var response = await addon.rebuild();
    res.json(response);
})

app.get("/getAllEntities", async function(req, res) {
    res.json(await fp.getAllEntityOptions());
})


var lastSetAllCache = {
    value: "",
    options: {}
};

async function doSetAll(value, res, options={}) {
    if (value == "repeat") {
        return await doSetAll(lastSetAllCache.value, res, lastSetAllCache.options);
    } else {
        lastSetAllCache.value = value;
        lastSetAllCache.options = options;
    }
    try {
        var cResponse = await light.setAll(value, options);
    } catch(e) {
        res.status(404).json({status: "failure", error: e.toString()})
        return;
    }
    history.last.command.set(value);
    try {
        // var cResponse = Color.from(value);
        var cssValue = cResponse.toCSS(true);
        history.last.css.set(cssValue);
    } catch(E) {
        // debugger;
    }
    if (typeof value == "string" && value.indexOf("back") == -1 && value.indexOf("forward") == -1) {
        var mapping = await light.generateSaveColorsString();
        history.addToHistory(mapping);
        history.last.mapping.set(mapping);
    }
    res.send({css:cssValue});
}

function doSetLight(light, value, res) {
    var color = Color.from(value);
    light.setLight({entity:light}, color);
    res.send(color.toCSS());
}