var registerFunctions = ["setAll", "apiPost", "apiGet", "filterLog"];

window.addEventListener("load", function() {
    for (funcName of registerFunctions) {
        window[funcName] = frame.contentWindow[funcName];
    }
})

window.addEventListener("message", function(e) {
    console.log("desktop", e)
    frame.contentWindow.handleRequest(e);
})