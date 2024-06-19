var counter = 0;
function genID() {
    return counter++;
}

var workingGradient = [{color:"red", percent:100, id: genID()}];
var gradientAngle = 0;
var selectGradResolveFunc = ()=>{};

function createGradient() {
    switchToMenu(gradientmenu);
    updateGradientStopList();
    return new Promise(function(resolve, reject) {
        selectGradResolveFunc = resolve;
    })
}

async function updateGradientStopList() {
    workingGradient = workingGradient.sort((a,b)=>a.percent-b.percent);
    angleDisplay.innerText = `Angle: ${gradientAngle} deg (click to change)`;
    //doStopSearch();
    stops.innerHTML = "";
    for (var i = 0; i < workingGradient.length; i++) {
        var stop = workingGradient[i];
        var stopDiv = document.createElement("div");
        var colorP = document.createElement("p");
        colorP.innerText = "Color: " + stop.color;
        var percentP = document.createElement("p");
        percentP.innerText = "Percent: " + stop.percent;
        stopDiv.append(colorP, percentP);
        stopDiv.setAttribute("data-stopnum", workingGradient[i].id);
        colorP.style.backgroundColor = (await getCSS(stop.color)).css;
        stopDiv.addEventListener("click", function(e) {
            editStop(+e.currentTarget.getAttribute("data-stopnum"));
        })
        stops.append(stopDiv);
    }

    var doneDiv = document.createElement("div");
    var doneP = document.createElement("p");
    doneP.innerText = "Done"
    var doneP2 = document.createElement("p");
    doneP2.innerText = "Click here to submit";
    doneDiv.append(doneP, doneP2);
    doneDiv.onclick = doneWithGradient;
    doneDiv.style.background = await getCSS(getGradientCode());
    stops.append(doneDiv);
}

var editingStop = 0;
var editID = 0;
async function editStop(stopID) {
    var stopNum = searchForID(stopID);
    editingStop = stopNum;
    editID = stopID;
    await renderStopEditor(stopNum);
    switchToMenu(stopeditor);
}

async function renderStopEditor(stopNum) {
    gradientColorBox.style.backgroundColor = await getCSS(workingGradient[stopNum].color);
    stopEditColor.innerText = "Color: " + workingGradient[stopNum].color;
    stopEditPercent.innerText = "Percent: " + workingGradient[stopNum].percent;
}

async function editColor() {
    var hexCode = workingGradient[editingStop].color;
    if (!isHexCode(hexCode)) {
        hexCode = await parseColor(hexCode, "hex");
    }
    var newColor = await selectColor(hexCode);
    if (typeof newColor !== "undefined") {
        workingGradient[editingStop].color = newColor;
    }
    updateGradientStopList();
    renderStopEditor(editingStop);
}

async function editPercent() {
    var defaultValue = workingGradient[editingStop].percent;
    var newPercent = await getNumberInput("Enter percent", defaultValue);
    workingGradient[editingStop].percent = newPercent;
    doStopSearch();
    updateGradientStopList();
    renderStopEditor(editingStop);
}

async function changeAngle() {
    var newAngle = await getNumberInput("Enter angle for gradient", gradientAngle);
    gradientAngle = newAngle;
    updateGradientStopList();
}

function addNewStop() {
    var newID = genID();
    workingGradient.push({color: "", percent: 100, id: newID});
    editStop(newID);
}

function deleteStop() {
    workingGradient.splice(editingStop, 1);
    updateGradientStopList();
    back();
}

function doStopSearch() {
    editingStop = searchForID(editID);
}

function searchForID(id) {
    workingGradient = workingGradient.sort((a,b)=>a.percent-b.percent);
    for (var i = 0; i < workingGradient.length; i++) {
        var stop = workingGradient[i];
        if (id == stop.id) return i;
    }
}

function getGradientCode() {
    var code = `eval(Gradient.construct([${workingGradient.map(generateStopCode).join(",")}], ${gradientAngle}))`;
    return code;
}

function generateStopCode(stop) {
    return `{color: '${stop.color}', percent: ${stop.percent/100}}`;
}

function doneWithGradient() {
    //selectGradResolveFunc(getGradientCode());
    attemptSetAll(getGradientCode());
    //back();
}

function degreeReplace(gradientCSS) {
    var rotateAngle = 0;
    if (localStorage.getItem("offsetAngle")) {
        rotateAngle = +localStorage.getItem("offsetAngle");
    }
    if (rotateAngle == 0) {
        return gradientCSS;
    }
    var regex = /(-?\d+(?:.\d+)?)deg/g;
    return gradientCSS.replace(regex, function(m, number) {
        return `${+number+rotateAngle}deg`;
    })
}

async function loadGradientStopsFromColor(color) {
    var css = await getCSS(color);
    if (css.indexOf("gradient") > -1) {
        [gradientAngle, workingGradient] = workingGradientFromCSSCode(css);
    } else {
        workingGradient = [{percent:0, color: color}];
    }
    updateGradientStopList();
}

function workingGradientFromCSSCode(css) {
    var degreePattern = /linear-gradient\((\d+)deg,/;
    var degree = +degreePattern.exec(css)[1]-90;
    var stopPattern = /rgba\((\d+), (\d+), (\d+), \d+\) (\d+)%/g;
    var stops = [...css.matchAll(stopPattern)].map(function(matchArray) {
        var r = matchArray[1];
        var g = matchArray[2];
        var b = matchArray[3];
        var p = +matchArray[4];
        return {
            percent: p,
            color: `rgb(${r}, ${g}, ${b})`,
            id: genID()
        }
    });
    return [degree, stops];
}