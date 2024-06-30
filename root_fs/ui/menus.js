HTMLElement.prototype.show = function() {
    this.removeAttribute("hidden");
}

HTMLElement.prototype.hide = function() {
    this.setAttribute("hidden", "true");
}

function hideAll() {
    var elements = Array.from(document.getElementsByClassName("menu"));
    elements.forEach(e=>e.hide());
}

var menuChain = [];
function switchToMenu(menu) {
    hideAll();
    var element = menu;
    if (typeof menu == "string") {
        element = document.getElementById(menu)
    }
    element.show();
    menuChain.push(element);
}

function back() {
    // console.log("back");
    if (getSelection().toString() == 'Back' && (menuChain[menuChain.length-1]==gradientmenu || menuChain[menuChain.length-1]==quickgradientmenu || menuChain[menuChain.length-1]==evenmenu)) {
        localStorage.offsetAngle = +prompt("Enter Offset Angle")
        return;
    }
    var last = menuChain.pop();
    hideAll();
    menuChain[menuChain.length-1].show();
    if (last == colorselectmenu) {
        selectColorResolveFunc();
    }
    if (menuChain[menuChain.length-1] == main) {
        selectColorResolveFunc();
        selectGradResolveFunc();
        selectQuickResolveFunc();
        selectSpaceResolveFunc();
    }
    if (menuChain[menuChain.length-1] == colorselectmenu && settings.alwaysBrowseColor) {
        back();
    }
    updateBackground();
}

window.addEventListener("load", function() {
    switchToMenu(main);
    if (locationDebug) {
        if (location.href.indexOf(":5500") > -1) {
            console.log("LightControl - VSCode Live Reload w/ Local Server")
        } else if (location.href.indexOf("duckdns") > -1) {
            console.log("LightControl - Main Server")
        } else {
            console.log("LightControl - Local Server")
        }
    }
})