var colorWeightData = [{color: "", weight: 1}];

window.addEventListener("load", renderColorWeightData)

function renderColorWeightData() {
    var tableBody = document.querySelector("#staticTable tbody");
    tableBody.innerHTML = "";
    for (var {color, weight} of colorWeightData) {
        var newTR = createTableRow(color, weight, tableBody.children.length);
        tableBody.append(newTR);
    }
}

function createTableRow(color, weight, index) {
    var tr = document.createElement("tr");
    tr.setAttribute("data-index", index);

    var colorTD = document.createElement("td");
    var colorInput = document.createElement("input");
    colorInput.type = "text";
    colorInput.placeholder = "Enter Color";
    colorInput.value = color;
    colorInput.addEventListener("change", updateColorWeightData);
    colorTD.append(colorInput);
    tr.append(colorTD);

    var weightTD = document.createElement("td");
    var weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.value = weight;
    weightInput.addEventListener("change", updateColorWeightData);
    weightTD.append(weightInput);
    tr.append(weightTD);

    var browseTD = document.createElement("td");
    var browseBtn = document.createElement("button");
    browseBtn.innerText = "Browse";
    browseBtn.addEventListener("click", browseBtnClicked);
    browseTD.append(browseBtn);
    tr.append(browseTD);

    var deleteTD = document.createElement("td");
    var deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.addEventListener("click", deleteBtnClicked)
    deleteTD.append(deleteBtn);
    tr.append(deleteTD);

    return tr;
}

function updateColorWeightData() {
    colorWeightData = [];
    for (var tr of document.querySelectorAll("#staticTable tbody tr")) {
        var color = tr.children[0].children[0].value;
        var weight = tr.children[1].children[0].valueAsNumber;
        if (isNaN(weight)) weight = 0;
        colorWeightData.push({color, weight});
    }
}

function deleteBtnClicked(e) {
    updateColorWeightData();
    var deleteBtn = e.currentTarget;
    var parentTR = deleteBtn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    colorWeightData.splice(index, 1);
    renderColorWeightData();
}

async function browseBtnClicked(e) {
    updateColorWeightData();
    var browseBtn = e.currentTarget;
    var parentTR = browseBtn.parentElement.parentElement;
    var index = Number(parentTR.getAttribute("data-index"));
    var newColor = await selectColor();
    if (typeof newColor === "undefined") return;
    colorWeightData[index].color = newColor;

    renderColorWeightData();
}

function newStaticRow() {
    updateColorWeightData();
    colorWeightData.push({color: "", weight: 1});
    renderColorWeightData();
}

async function submitStaticRandom() {
    await setAll(createStaticRandomSetAllCode());
}

function createStaticRandomCode() {
    updateColorWeightData();
    var colorWeightComponents = colorWeightData.map(({color, weight})=>`{"color":"${color}", "weight":${weight}}`);
    return "[" + colorWeightComponents.join(",") + "]";
}

function createStaticRandomSetAllCode() {
    return `eval(funky.randomWeightedStatic(${createStaticRandomCode()}))`;
}

function readFromRandomStaticCode() {
    colorWeightData = json.parse(prompt("Enter Static Code"));
    renderColorWeightData();
}