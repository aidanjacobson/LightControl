function switchTo(pageElement) {
    for (var page of document.querySelectorAll(".page")) {
        page.hide();
    }
    pageElement.show();
    for (var i = 0; i < modeSelect.options.length; i++) {
        if (modeSelect.options[i].value == pageElement.id) {
            modeSelect.selectedIndex = i;
        }
    }
}

function renderModeOptions() {
    modeSelect.innerHTML = "";
    for (var page of document.querySelectorAll(".page")) {
        var option = document.createElement("option");
        option.value = page.id;
        option.innerText = page.getAttribute("page-name");
        modeSelect.append(option);
    }
}

window.addEventListener("load", function() {
    renderModeOptions();
    if (location.hash != "" && location.hash != "#") {
        switchTo(document.querySelector(location.hash));
    }
});

function doModeChange() {
    var selectId = modeSelect.options[modeSelect.selectedIndex].value;
    switchTo(document.getElementById(selectId));
    location.hash = "#" + selectId;
}