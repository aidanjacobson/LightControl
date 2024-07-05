var renderAllColors = false;
var selectColorResolveFunc = ()=>{};
function selectColor(value="") {
    if (getSelection().toString() == 'Color') {
        if (confirm(`Turn alwaysBrowseColor ${settings.alwaysBrowseColor?"off":"on"}?`)) {
            settings.alwaysBrowseColor = !settings.alwaysBrowseColor;
            alert(`alwaysBrowseColor is ${settings.alwaysBrowseColor?"on":"off"}.`)
        }
        settings.save();
        clearSelection();
        return;
    }
    if (value != "") {
        setColorInput(value);
    }
    switchToMenu(colorselectmenu);
    return new Promise(function(resolve, reject) {
        selectColorResolveFunc = resolve;
        if (settings.alwaysBrowseColor) colorBrowse();
    })
}

function clearSelection()
{
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
}

function backFromColor() {
    switchToMenu(main);
    selectColorResolveFunc();
}

function colorSubmit() {
    selectColorResolveFunc(inputcolor.value);
    switchToMenu(main);
}

var colorList = [];
async function colorType(renderAll=false) {
    colorList = await getAllColors();
    renderAllColors = renderAll;
    switchToMenu(colortypemenu);
    colornameinput.value = "";
    colornameinput.focus();
    colornameinput.select();
    populateSearchList({keyCode:0});
}

function colorBrowse() {
    colorType(true);
}

async function setColorInput(input) {
    var hexCode = input;
    if (!isHexCode(input)) {
        hexCode = await parseColor(hexCode, "hex");
    }
    inputcolor.value = hexCode;
}

function isHexCode(code) {
    if (typeof code != "string") return false;
    var regex = /^#[0-9A-F]{6}$/;
    return regex.test(code);
}

async function populateSearchList(e) {
    var typed = colornameinput.value.toLowerCase().replace(/ /g, "").replace(/_/g, "");
    if (e.keyCode == 13) {
        // if (typed == "back") {
        //     //back();
        //     switchToMenu(colorselectmenu);
        //     return;
        // }
        setColorInput(colornameinput.value);
        selectColorResolveFunc(colornameinput.value);
        back();
    }
    var matches = [];
    if (typed != "" || renderAllColors) {
        matches = colorList.colors.filter(color=>color.indexOf(typed) > -1);
        if (typed != "") {
            for (var i = 0; i < matches.length; i++) {
                if (matches[i].indexOf(typed) == 0 && (colorList.css.indexOf(matches[i])>-1 || colorList.custom.indexOf(matches[i])>-1)) {
                    var match = matches[i];
                    matches.splice(i, 1);
                    matches.unshift(match);
                }
            }
            if (matches.indexOf(typed) > -1) {
                var index = matches.indexOf(typed);
                matches.splice(index, 1);
                matches.unshift(typed);
            }
        }
    }
    searchResults.innerHTML = "";
    for (var i = 0; i < matches.length; i++) {
        var color = matches[i];
        var p = document.createElement("p");
        p.innerText = color;
        p.addEventListener("click", function(e) {
            if (dontGoBack && menuChain[menuChain.length-2==main]) {
                attemptSetAll(e.target.getAttribute("data-color"));
            } else {
                selectColorResolveFunc(e.target.getAttribute("data-color"));
                back();
            }
        });

        if (settings.renderColorBrowsePreview) {
            p.style.background = await lookupCSS(color)
        }

        p.setAttribute("data-color", color);
        searchResults.append(p);
    }
}

function backFromColorType() {
    switchToMenu(colorselectmenu);
}

var cssCodes = {};
window.addEventListener("load", async function() {
    colornameinput.onkeyup = populateSearchList;
    colornameinput.onkeydown = function(e) {
        if (e.keyCode == 9) {
            colornameinput.value = searchResults.children[0].getAttribute("data-color");
            e.preventDefault();
        }
    }
    colorList = await getAllColors();
    if (settings.renderColorBrowsePreview) updateCssCodes();
})

async function updateCssCodes() {
    var codeList = await getCSS(colorList.colors);
    for (var i = 0; i < codeList.length; i++) {
        cssCodes[colorList.colors[i]] = codeList[i];
    }
}

async function lookupCSS(color) {
    if (typeof cssCodes[color] !== "undefined") {
        return cssCodes[color];
    } else {
        return (await getCSS(color)).css;
    }
}
