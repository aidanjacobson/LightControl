async function colorGroupsClick() {
    switchToMenu(colorgroupslanding);
    await renderColorGroupsLanding();
}

async function renderColorGroupsLanding() {
    var groups = await apiGet("/savedColorGroups/info");
    colorgroupcontainer.innerHTML = "";
    for (var group of groups) {
        var btn = document.createElement("button");
        btn.classList.add("buttonoption");
        btn.innerText = group.name;
        btn.onclick = createColorGroupButtonOnclickFunction(group.id);

        colorgroupcontainer.append(btn);
    }
}

async function goToColorGroup(groupID) {
    switchToMenu(colorgroupdisplay);
    var groupInfo = await apiGet(`/savedColorGroups/colors/${groupID}`);
    groupdisplaycontainer.innerHTML = "";
    for (var colorname of groupInfo) {
        var btn = document.createElement("button");
        btn.classList.add("buttonoption", "half");
        btn.innerText = colorname;
        if (colorname in cssCodes && cssCodes[colorname] != "") {
            console.log(cssCodes[colorname])
            btn.style.background = cssCodes[colorname];
        } 
        btn.onclick = createColorGroupDisplaySetFunction(colorname);

        groupdisplaycontainer.append(btn);
    }
}

function createColorGroupButtonOnclickFunction(groupID) {
    return function() {
        goToColorGroup(groupID);
    }
}

function createColorGroupDisplaySetFunction(colorname) {
    return function() {
        attemptSetAll(colorname);
    }
}