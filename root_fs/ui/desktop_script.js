var registerFunctions = ["setAll", "apiPost", "apiGet", "filterLog"];

window.addEventListener("load", function() {
    for (funcName of registerFunctions) {
        window[funcName] = frame.contentWindow[funcName];
    }
})