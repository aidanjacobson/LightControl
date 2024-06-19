var cbList = [];
async function choosebetween_editcolor() {
    cbList = await getColorList(cbList);
    renderCBDisplay();
}

function generateCB() {
    return `eval(chooseBetweenColors(${cbList.map(c=>`"${c}"`).join(", ")}))`;
}

function cb_submit() {
    attemptSetAll(generateCB());
}

function renderCBDisplay() {
    if (cbList.length > 0) {
        choosebetweendisplay.innerText = `Color List: ${cbList.join(", ")}`;
    } else {
        choosebetweendisplay.innerText = "No colors yet - add one using the edit menu"
    }
}