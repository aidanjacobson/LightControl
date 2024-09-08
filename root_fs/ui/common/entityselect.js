var lightControlOrigin = `${location.protocol}//${location.host}`;

var lightControlSelectorURL = lightControlOrigin + "/ui/entityselector";

function selectEntity() {
    return new Promise((resolve, reject) => {
        window.selectWindow = window.open(lightControlSelectorURL)
        selectWindow.addEventListener("load", function() {
            selectWindow.addCallback(function() {
                selectWindow.close();
            })
            selectWindow.addCallback(resolve);
        })
    })
}