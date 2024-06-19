var colorListResolveFunc = ()=>{};
function getColorList(defaultColors=[]) {
    switchToMenu(colorlistmenu);
    colorsInList = defaultColors;
    renderColorsInList();
    return new Promise(function(resolve) {
        colorListResolveFunc = resolve;
    })
}

var colorsInList = [];
async function colorlist_add() {
    var newColor = await selectColor();
    if (newColor) {
        colorsInList.push(newColor);
        renderColorsInList();
    }
}

function renderColorsInList() {
    colorlistdisplay.innerHTML = "";
    for (var i = 0; i < colorsInList.length; i++) {
        var color = colorsInList[i];
        var cli = document.createElement("div");
        cli.classList.add("colorlistitem")
        var colordisp = document.createElement("p").setInnerText(`Color: ${color}`);
        cli.append(colordisp);

        var editBtn = document.createElement("span").setInnerText("Edit");
        editBtn.classList.add("colorlistitemaction");
        editBtn.setAttribute("data-index", i);
        editBtn.onclick = editBtnClick;
        cli.append(editBtn);

        var deleteBtn = document.createElement("span").setInnerText("Delete");
        deleteBtn.classList.add("colorlistitemaction");
        deleteBtn.setAttribute("data-index", i);
        deleteBtn.onclick = deleteBtnClick;
        cli.append(deleteBtn);
        colorlistdisplay.append(cli);
    }
}

async function editColorListColor(index) {
    var newColor = await selectColor(colorsInList[index]);
    if (newColor) {
        colorsInList[index] = newColor;
        renderColorsInList();
    }
}

HTMLElement.prototype.setInnerText = function(text) {
    this.innerText = text;
    return this;
}

function editBtnClick(e) {
    var index = +e.target.getAttribute("data-index");
    editColorListColor(index);
}

function deleteBtnClick(e) {
    var index = +e.target.getAttribute("data-index");
    if (confirm(`Are you sure you want to delete color ${colorsInList[index]}?`)) {
        colorsInList.splice(index, 1);
        renderColorsInList();
    }
}

function colorlist_done() {
    colorListResolveFunc(colorsInList);
    back();
}