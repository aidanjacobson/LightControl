var areaBuilderArguments = [{entity: "", color: ""}];
var defaultColor = "donotchange"

function renderTable() {
    var tableBody = document.querySelector("#areaTable tbody");
    tableBody.innerHTML = "";

    for(var {entity, color} of areaBuilderArguments) {
        var newTR = createTableRow(entity, color, tableBody.children.length);
        tableBody.append(newTR);
    }

    defaultColorInput.value = defaultColor;
}

function createTableRow(entity, color, index) {
    var tr = document.createElement("tr");
    tr.prop("data-index", index);

    var entityInput = el("input").setType("text").val(entity).prop("placeholder", "Enter Entity Name").change(pullDataFromTable);
    tr.append(makeTD(entityInput));

    var browseEntityBtn = el("button").text("Browse Entities").click(browseEntityButtonClicked);
    tr.append(makeTD(browseEntityBtn));

    var colorInput = el("input").setType("text").val(color).prop("placeholder", "Enter Color").change(pullDataFromTable);
    tr.append(makeTD(colorInput));

    var browseBtn = el("button").text("Browse Colors").click(browseButtonClicked);
    tr.append(makeTD(browseBtn));

    var deleteBtn = el("button").text("Delete").click(deleteButtonClicked);
    tr.append(makeTD(deleteBtn));

    var upBtn = el("button").text("Up").click(upClicked);
    var downBtn = el("button").text("Down").click(downClicked);
    tr.append(makeTD(upBtn, downBtn));

    return tr;
}

function pullDataFromTable() {
    areaBuilderArguments = [];
    for (var tr of document.querySelectorAll("#areaTable tbody tr")) {
        var entity = tr.children[0].children[0].value;
        var color = tr.children[2].children[0].value;
        areaBuilderArguments.push({entity, color});
    }
    defaultColor = defaultColorInput.value;
}

async function browseForDefault() {
    var newColor = await selectColor();
    defaultColorInput.value = newColor;
}

function upClicked(e) {
    pullDataFromTable();
    var btn = e.currentTarget;
    var parentTR = btn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    if (index <= 0) return;
    var temp = areaBuilderArguments[index-1];
    areaBuilderArguments[index-1] = areaBuilderArguments[index];
    areaBuilderArguments[index] = temp;
    renderTable();
}

function downClicked(e) {
    pullDataFromTable();
    var btn = e.currentTarget;
    var parentTR = btn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    if (index >= areaBuilderArguments.length-1) return;
    var temp = areaBuilderArguments[index+1];
    areaBuilderArguments[index+1] = areaBuilderArguments[index];
    areaBuilderArguments[index] = temp;
    renderTable();
}

async function browseButtonClicked(e) {
    pullDataFromTable();
    var browseBtn = e.currentTarget;
    var parentTR = browseBtn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    var newColor = await selectColor();
    if (typeof newColor === "undefined") return;
    areaBuilderArguments[index].color = newColor;
    renderTable();
}

function deleteButtonClicked(e) {
    pullDataFromTable();
    var btn = e.currentTarget;
    var parentTR = btn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    areaBuilderArguments.splice(index, 1);
    renderTable();
}

async function browseEntityButtonClicked(e) {
    pullDataFromTable();
    var browseBtn = e.currentTarget;
    var parentTR = browseBtn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    var selectedEntities = await selectEntity();
    var entityName = "";
    if (typeof selectedEntities == "string") {
        entityName = selectedEntities;
    } else {
        entityName = selectedEntities.join(",");
    }
    areaBuilderArguments[index].entity = entityName;
    renderTable();
}

function newTableRow() {
    pullDataFromTable();
    areaBuilderArguments.push({entity: "", color: ""});
    renderTable();
}

function createAreaBuilderSetAllCode() {
    pullDataFromTable();
    var argumentComponents = areaBuilderArguments.map(({entity, color}) => `{lights: "${entity}", color: "${color}"}`)
    return `eval(new AreaBuilder([${argumentComponents.join(", ")}], "${defaultColor.replaceAll("\"", "\\\"")}"))`;
}

function submitAreaBuilder() {
    setAll(createAreaBuilderSetAllCode())
}

window.addEventListener("load", renderTable)