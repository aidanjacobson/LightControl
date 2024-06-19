var selectSpaceResolveFunc = ()=>{};
var spaceAngle = 0;
var spaceTL = "red", spaceTR = "blue", spaceBR = "red", spaceBL = "blue";
function makeColorSpace() {
    switchToMenu(colorspacemenu);
    return new Promise(function(resolve, reject) {
        selectSpaceResolveFunc = resolve;
    })
}

function renderSpaceColorMenu() {
    angleDisplaySpace.innerText = `Angle: ${spaceAngle}`;
    colorspaceTL.innerText = `Top Left: ${spaceTL}`;
    colorspaceTR.innerText = `Top Right: ${spaceTR}`;
    colorspaceBR.innerText = `Bottom Right: ${spaceBR}`;
    colorspaceBL.innerText = `Bottom Left: ${spaceBL}`;
}

async function changeAngleColorSpace() {
    var newAngle = await getNumberInput("Enter new angle", spaceAngle);
    spaceAngle = newAngle;
    renderSpaceColorMenu();
}

async function changeColorSpaceTL() {
    var newColor = await selectColor(spaceTL);
    spaceTL = newColor;
    renderSpaceColorMenu();
}

async function changeColorSpaceTR() {
    var newColor = await selectColor(spaceTR);
    spaceTR = newColor;
    renderSpaceColorMenu();
}

async function changeColorSpaceBR() {
    var newColor = await selectColor(spaceBR);
    spaceBR = newColor;
    renderSpaceColorMenu();
}

async function changeColorSpaceBL() {
    var newColor = await selectColor(spaceBL);
    spaceBL = newColor;
    renderSpaceColorMenu();
}

function spaceDone() {
    var commandText = `colorspace(${spaceTL}, ${spaceTR}, ${spaceBR}, ${spaceBL}, ${spaceAngle})`;
    //selectSpaceResolveFunc(commandText);
    attemptSetAll(commandText);
}