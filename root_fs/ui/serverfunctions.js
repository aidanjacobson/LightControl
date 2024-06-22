async function getAllColors() {
    return await apiGet("/getcolors");
}

async function updateColors() {
    return await apiGet("/updatecolors");
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
async function setAll(colorValue, angle) {
    color = colorValue;
    if (typeof angle !== "undefined") {
        color += ", " + angle;
    }
    console.log(color);
    var setPath = "/setAll";
    if (!settings.useSene) setPath = "/setAllNoScene";
    return (await apiPost(setPath, {color})).css;
}

function apiGet(path) {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}${path}`;
        if (path[0] != "/") url = `${baseURL}/${path}`;
        x.open("GET", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.setRequestHeader("Origin-ID", "lightcontrol-ui")
        x.setRequestHeader("Security-key", localStorage.lightcontrol_key)
        x.onload = function() {
            if (x.status == 401) {
                login();
            }
            resolve(JSON.parse(x.responseText));
        }
        x.send();
    })
}

function apiPost(path, data) {
    return new Promise(function(resolve, reject) {
        var x = new XMLHttpRequest();
        var url = `${baseURL}${path}`;
        if (path[0] != "/") url = `${baseURL}/${path}`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.setRequestHeader("Origin-ID", "lightcontrol-ui")
        x.setRequestHeader("Security-key", localStorage.lightcontrol_key)
        x.onload = function() {
            if (x.status == 401) {
                login();
            }
            try {
                resolve(JSON.parse(x.responseText));
            } catch(e) {
                console.log(path, data, e);
            }
        }
        x.send(JSON.stringify(data));
    })
}

window.addEventListener("load", function() {
    if (typeof localStorage.lightcontrol_key !== "undefined") {
        apiGet("/testlogin");
    } else {
        login();
    }
})
async function login() {
    localStorage.removeItem("lightcontrol_key");
    var newpass = await getNumberInput("Enter Decryption Key:");
    localStorage.setItem("lightcontrol_key", newpass);
    location.reload();
}

async function logout() {
    localStorage.removeItem("lightcontrol_key");
    location.reload();
}

async function getCSS(color) {
    var response = await apiPost("/getcss", {color});
    return degreeReplace(response.css);
}

async function parseColor(color, type="rgb") {
    var response = await apiPost("/parsecolor");
    if (response.status == "success") {
        return convertParseColorType(response.color, type);
    } else {
        return convertParseColorType({r:0,g:0,b:0}, type);
    }
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

async function saveColor(color, name) {
    colorList = await getAllColors();
    return await apiPost("/saveColor", {color,name});
}

async function saveColorScene(name, nocache=false) {
    colorList = await getAllColors();
    return await apiPost("/saveColorScene", {name, nocache});
}