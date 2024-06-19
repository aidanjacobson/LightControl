var light = require("./lightcommand/light");
var segment = require("./lightcommand/segmentedled");
var Color = require("./color");

function timeout(millis) {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve();
        }, millis)
    })
}

async function testSegments() {
    await require("./lightcommand/floorplan").updateFloorplan();
    await require("./colornames/colornames").loadColors();
    var cIndex = 0;
    var colors = ["red", "yellow", "green", "cyan", "blue", "magenta"].map(c=>new Color(c));
    function newColor() {
        return colors[(cIndex++) % colors.length];
    }
    
    var segments = makeSegments("individual");

    var white = new Color("white");
    await light.setLight({entity:"light.corner_light_strip"}, white, true);
    await light.setLight({entity:"light.bed_light_strip"}, white, true);

    await timeout(1000);

    for (lightName of segments) {
        segment.setSegmentLight(lightName, newColor(), false);
    }
}

function makeSegments(type) {
    if (type == "individual") {
        // var segmentsAR = new Array(12).fill(0).map((n,i)=>({entity:`segment.bed_light_strip.${i}`}));
        var segmentsAR = [];
        var segmentsLR = new Array(12).fill(0).map((n,i)=>({entity:`segment.corner_light_strip.${i}`}));
        var segments = segmentsAR.concat(segmentsLR);
        return segments;
    }

    if (type == "quarters") {
        // var segmentsAR = new Array(4).fill(0).map((n,i)=>({entity:`segment.bed_light_strip.quarter_${i+1}`}));
        var segmentsAR = [];
        var segmentsLR = new Array(4).fill(0).map((n,i)=>({entity:`segment.corner_light_strip.quarter_${i+1}`}));
        var segments = segmentsAR.concat(segmentsLR);
        return segments;
    }
}

testSegments();