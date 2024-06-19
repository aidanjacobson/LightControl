var quickAngle = 0;
var quickColor1 = "red";
var quickColor2 = "blue";

var selectQuickResolveFunc = ()=>{};
function makeQuickGradient() {
    switchToMenu(quickgradientmenu);
    return new Promise(function(resolve, reject) {
        selectQuickResolveFunc = resolve;
    })
}

function renderQuickColorMenu() {
    angleDisplayQuickGrad.innerText = `Angle: ${quickAngle}`;
    quickColorElement1.innerText = `Color 1: ${quickColor1}`;
    quickColorElement2.innerText = `Color 2: ${quickColor2}`;
}

async function changeAngleQuickGrad() {
    var newAngle = await getNumberInput("Enter new angle", quickAngle);
    quickAngle = newAngle;
    renderQuickColorMenu();
}

async function changeQuickColor1() {
    var newColor = await selectColor(quickColor1);
    //back();
    quickColor1 = newColor;
    renderQuickColorMenu();
}

async function changeQuickColor2() {
    var newColor = await selectColor(quickColor2);
    //back();
    quickColor2 = newColor;
    renderQuickColorMenu();
}

function quickDone() {
    var commandText = `eval(Gradient.quickGradient("${quickColor1}", "${quickColor2}", ${quickAngle}))`;
    // selectQuickResolveFunc(commandText);
    attemptSetAll(commandText);
    //back();
}