var groups = [];
async function updateGroupList() {
    groups = await apiGet("/getAllGroups");

    groupListTable.innerHTML = "";
    for (var group of groups) {
        groupListTable.append(createTRForGroup(group));
    }
}

function createTRForGroup({entity, friendlyName}) {
    var tr = document.createElement("tr");
    tr.setAttribute("group-id", entity);

    var nameTD = document.createElement("td");
    nameTD.innerText = friendlyName;
    tr.append(nameTD);

    var lockTD = document.createElement("td");
    var lockBtn = document.createElement("button");
    lockBtn.innerText = "Lock";
    lockBtn.onclick = groupLockFunction;
    lockTD.append(lockBtn);
    tr.append(lockTD);

    var unlockTD = document.createElement("td");
    var unlockBtn = document.createElement("button");
    unlockBtn.innerText = "Unlock";
    unlockBtn.onclick = groupUnlockFunction;
    unlockTD.append(unlockBtn);
    tr.append(unlockTD);
    
    return tr;
}

async function groupLockFunction(e) {
    var groupID = e.target.parentElement.parentElement.getAttribute("group-id");
    var groupMembers = await apiGet(`/getAllActiveEntitiesInGroup/${groupID}`);
    for (var {entity} of groupMembers) {
        if (! (entity in lockedColorData)) {
            await syncColor(entity);
        }
    }
    syncAllColorsToSavedData();
}

async function groupUnlockFunction(e) {
    var groupID = e.target.parentElement.parentElement.getAttribute("group-id");
    var groupMembers = await apiGet(`/getAllActiveEntitiesInGroup/${groupID}`);
    for (var {entity} of groupMembers) {
        if ((entity in lockedColorData)) {
            delete lockedColorData[entity];
        }
    }
    syncAllColorsToSavedData();
}