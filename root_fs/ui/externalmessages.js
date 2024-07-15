var acceptableOrigins = ["http://localhost:9168", "https://aidanjacobson.duckdns.org:9168", "http://localhost:10615", "http://aidanjacobson.duckdns.org:10615"]

window.addEventListener("message", handleRequest);

async function handleRequest(e) {
    console.log(e);
    if (acceptableOrigins.indexOf(e.origin) == -1) return;
    if (e.data.type == "color") {
        e.source.postMessage({type: "color", role: "response", color: await selectColor()}, "*");
    }
    if (e.data.type == "echo") {
        e.source.postMessage({type: "echo", role: "response", value: e.data.value}, "*")
    }
}