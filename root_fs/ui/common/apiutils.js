function apiPost(path, data) {
    return new Promise(function(resolve, reject) {
        var baseURL = location.origin;
        var x = new XMLHttpRequest();
        var url = `${baseURL}${path}`;
        if (path[0] != "/") url = `${baseURL}/${path}`;
        x.open("POST", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.setRequestHeader("Origin-ID", "lightcontrol-ui")
        x.setRequestHeader("Security-key", localStorage.lightcontrol_key)
        x.onload = function() {
            try {
                resolve(JSON.parse(x.responseText));
            } catch(e) {
                console.log(path, data, e);
            }
        }
        x.send(JSON.stringify(data));
    })
}

function apiGet(path) {
    return new Promise(function(resolve, reject) {
        var baseURL = location.origin;
        var x = new XMLHttpRequest();
        var url = `${baseURL}${path}`;
        if (path[0] != "/") url = `${baseURL}/${path}`;
        x.open("GET", url);
        x.setRequestHeader("Content-Type", "application/json");
        x.setRequestHeader("Origin-ID", "lightcontrol-ui")
        x.setRequestHeader("Security-key", localStorage.lightcontrol_key)
        x.onload = function() {
            try {
                resolve(JSON.parse(x.responseText));
            } catch(e) {
                console.log(path, data, e);
            }
        }
        x.send();
    })
}

async function setAll(color, noscene=true) {
    if (window.opener && window.opener.attemptSetAll) {
        console.log("setall through opener")
        window.opener.attemptSetAll(color);
        return;
    }
    var endpoint = noscene ? "/setAllNoScene" : "/setAll"
    await apiPost(endpoint, {color});
}

function copyClipboard(text) {
    navigator.clipboard.writeText(text);
}

async function getFloorplan() {
    return await apiGet("/getFloorplan");
}

async function setFloorplan(floorplan) {
    return await apiPost("/setFloorplan", floorplan);
}