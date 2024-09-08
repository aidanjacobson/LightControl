window.addEventListener("load", function() {
    processExpandableMenus();
    renderEntityTables();
})

function processExpandableMenus() {
    var expandables = document.querySelectorAll(".expandable");
    for (element of expandables) {
        element.addEventListener("click", function(e) {
            e.target.classList.toggle("expanded");
        });
    }
}

var allEntities = {};

function getInfoByID(id) {
    if (! allEntities.all) return;
    var entity = allEntities.all.find(info=>info.entity==id);
    return entity;
}

async function updateAllEntities() {
    allEntities = await apiGet("/getAllEntities");
}

async function renderEntityTables() {
    await updateAllEntities();
    entitiesTable.innerHTML = segmentsTable.innerHTML = groupsTable.innerHTML = "";
    entitiesTable.append(...createEntityRowList(allEntities.entities));
    segmentsTable.append(...createEntityRowList(allEntities.segments));
    groupsTable.append(...createEntityRowList(allEntities.groups));
}

function createEntityRowList(entityInfoList) {
    return entityInfoList.map(createEntityRow);
}

function createEntityRow(entityInfo) {
    var row = document.createElement("tr");
    row.setAttribute("entity-id", entityInfo.entity);

    var entityIDTD = document.createElement("td");
    entityIDTD.innerText = entityInfo.entity;
    row.append(entityIDTD)

    var friendlyNameTD = document.createElement("td");
    friendlyNameTD.innerText = entityInfo.friendlyName;
    row.append(friendlyNameTD);

    var actionsTD = document.createElement("td");
    row.append(actionsTD);

    var selectBtn = document.createElement("button");
    selectBtn.innerText = "Select Only This";
    selectBtn.onclick = selectOnlyThisOnclick;
    actionsTD.append(selectBtn);

    var addBtn = document.createElement("button");
    addBtn.innerText = "Add To Group";
    addBtn.onclick = addToGroupOnclick;
    actionsTD.append(addBtn);

    return row;
}

function selectOnlyThisOnclick(e) {
    var entityID = e.currentTarget.parentElement.parentElement.getAttribute("entity-id");
    returnValue(entityID);
}

function addToGroupOnclick(e) {
    var entityID = e.currentTarget.parentElement.parentElement.getAttribute("entity-id");
    var info = getInfoByID(entityID);
    groupElements.push(info);
    renderGroup();
}

var groupElements = [];
function renderGroup() {
    groupOutput.innerHTML = "";
    if (groupElements.length == 0) {
        currentGroupContainer.setAttribute("hidden", true);
    } else {
        currentGroupContainer.removeAttribute("hidden");
    }
    groupOutput.append(...createGroupEntityRowList(groupElements))
}

function createGroupEntityRowList(entityInfoList) {
    return entityInfoList.map(createGroupEntityRow);
}

function createGroupEntityRow(entityInfo) {
    var row = document.createElement("tr");
    row.setAttribute("entity-id", entityInfo.entity);

    var entityIDTD = document.createElement("td");
    entityIDTD.innerText = entityInfo.entity;
    row.append(entityIDTD)

    var friendlyNameTD = document.createElement("td");
    friendlyNameTD.innerText = entityInfo.friendlyName;
    row.append(friendlyNameTD);

    var actionsTD = document.createElement("td");
    row.append(actionsTD);

    var selectBtn = document.createElement("button");
    selectBtn.innerText = "Delete";
    selectBtn.onclick = groupDeleteOnclick;
    actionsTD.append(selectBtn);

    return row;
}

function groupDeleteOnclick(e) {
    var entityID = e.currentTarget.parentElement.parentElement.getAttribute("entity-id");
    var index = groupElements.findIndex(info=>info.entity==entityID);
    if (index == -1) return;
    groupElements.splice(index, 1);
    renderGroup();
}

function submitCurrentGroup() {
    var values = groupElements.map(i=>i.entity);
    returnValue(values);
}

function returnValue(value) {
    console.log("Returned", value);
    callbacks.forEach(cb=>cb(value));
}

var callbacks = [];
function addCallback(fn) {
    callbacks.push(fn);
}