/*
widht/height
mobile" ~0.524344
desktop: 2.107574
*/

if (location.href.indexOf("noredirect") == -1 && innerWidth/innerHeight > 1) {
    location.href = "desktop.html";
}

async function mainmenu_colorselect() {
    attemptSetAll(await selectColor())
}


async function mainmenu_gradientselect() {
    attemptSetAll(await createGradient())
}

async function mainmenu_quickgradient() {
    attemptSetAll(await makeQuickGradient());
}

async function mainmenu_colorspaceselect() {
    attemptSetAll(await makeColorSpace());
}

async function mainmenu_colortheme() {
    await getColorTheme();
}

async function mainmenu_preview() {
    if (getSelection().toString() == 'Preview') {
        if (confirm(`Are you sure you want to turn color rendering ${settings.renderColorBrowsePreview ? "off" : "on"}?`)) {
            settings.renderColorBrowsePreview = !settings.renderColorBrowsePreview;
            if (settings.renderColorBrowsePreview) updateCssCodes();
            settings.save();
        }
        return;
    }
    switchToMenu(previewmenu);
    updateBackground();
}

var preview = "red";
var lastColor;
async function attemptSetAll(value) {
    if (typeof value == "undefined") {
        console.log("Failed setall response")
    } else {
        lastColor = value;
        var output = await setAll(value);
        preview = output;
        if (dontGoBack) {
            //switchToMenu(colortypemenu)
        } else {
            menuChain = [];
            switchToMenu(main);
        }
        updateBackground();
    }
}

function updateBackground() {
    colorOutput.style.background = preview;
    if (menuChain[menuChain.length-1]==previewmenu) {
        document.body.style.background = preview;
    } else {
        document.body.style.background = "darkblue";
    }
}

async function syncPreview() {
    var lastCss = (await apiGet("/history/last/css")).css;
    if (lastCss) {
        preview = lastCss;
        updateBackground();
    }
}

window.addEventListener("load", syncPreview)

setInterval(syncPreview, 3000);

function mainmenu_choosebetween() {
    switchToMenu(choosebetweenmenu);
    renderCBDisplay();
}

function mainmenu_savecolor() {
    var name = prompt("Enter color name");
    saveColor(lastColor, name);
}

async function mainmenu_savecolorscene() {
    var name = prompt("Enter scene name");
    await saveColorScene(name);
    alert(`Successfully saved scene ${name}.`);
}

async function mainmenu_savecolorscenenocache() {
    var name = prompt("Enter scene name");
    await saveColorScene(name, true);
    alert(`Successfully saved scene ${name}.`);
}