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

async function setAll(color) {
    await apiPost("/setAll", {color});
}

function copyClipboard(text) {
    navigator.clipboard.writeText(text);
}