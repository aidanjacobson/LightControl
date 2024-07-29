// const lightControlOrigin = "http://localhost:9168";
// const lightControlOrigin = "https://aidanjacobson.duckdns.org:9168";
const lightControlOrigin = `${location.protocol}//${location.host}`;

var lightControlURL = lightControlOrigin + "/ui"

var lastID = 0;
function genID() {
    return lastID++;
}

function selectColor() {
    window.lightControlWindow = window.open(lightControlURL, 'lightcontrol');
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            lightControlWindow.postMessage({type: "color", role: "request", id: genID()}, lightControlOrigin);
            window.addEventListener("message", function(e) {
                if (e.data.type == "color" && e.data.role == "response") {
                    lightControlWindow.close();
                    resolve(e.data.color);
                }
            })
        }, 1000);
    })
}