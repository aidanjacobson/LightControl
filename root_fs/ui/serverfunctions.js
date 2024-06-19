function getAllColors() {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}/getcolors`;
        x.open("GET", url);
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send();
    })
}

function updateColors() {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}/updateColors`;
        x.open("GET", url);
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send();
    })
}

window.addEventListener("load", function() {
    updateColors();
})

const localoverride = false;
var baseURL = "https://" + location.host;
if (!localoverride && (location.href.indexOf("localhost") > -1 || location.href.indexOf("127.0.0.1") > -1)) {
    baseURL = "http://localhost:9168";
    pageTitle.innerText = "LightControl - Local";
}

var color;
function setAll(colorValue, angle) {
    color = colorValue;
    if (typeof angle !== "undefined") {
        color += ", " + angle;
    }
    console.log(color);
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var setPath = "setAll";
        if (!settings.useSene) setPath = "setAllNoScene";
        var url = `${baseURL}/${setPath}`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            resolve(x.responseText);
        }
        x.send(JSON.stringify({color:color}));
    })
}

function apiGet(path) {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}${path}`;
        if (path[0] != "/") url = `${baseURL}/${path}`;
        x.open("GET", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send();
    })
}

function getCSS(color) {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}/getcss`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            var response = x.responseText;
            var css = JSON.parse(response).css;
            resolve(degreeReplace(css));
        }
        x.send(JSON.stringify({color:color}));
    })
}

function parseColor(color, type="rgb") {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}/parsecolor`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            var response = JSON.parse(x.responseText);
            if (response.status == "success") {
                resolve(convertParseColorType(response.color, type))
            } else {
                resolve(convertParseColorType({r:0,g:0,b:0}, type));
            }
        }
        x.send(JSON.stringify({color:color}));
    })
}

function convertParseColorType({r, g, b}, type) {
    var out = {r, g, b};
    if (type == "hex") {
        out = rgbToHexCode(r, g, b);
    }
    return out;
}

function rgbToHexCode(r, g, b) {
    function formatByte(n) {
        return n.toString(16).padStart(2, '0').toUpperCase();
    }
    var rCode = formatByte(r);
    var gCode = formatByte(g);
    var bCode = formatByte(b);
    return `#${rCode}${gCode}${bCode}`;
}

function saveColor(color, name) {
    return new Promise(async function(resolve, reject) {
        colorList = await getAllColors();
        var x = new XMLHttpRequest();
        var url = `${baseURL}/saveColor`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send(JSON.stringify({color,name}));
    })
}

function saveColorScene(name, nocache=false) {
    return new Promise(async function(resolve, reject) {
        colorList = await getAllColors();
        var x = new XMLHttpRequest();
        var url = `${baseURL}/saveColorScene`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send(JSON.stringify({name, nocache}));
    })
}