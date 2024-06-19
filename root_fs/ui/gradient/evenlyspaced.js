function mainmenu_evenlyspaced() {
    switchToMenu(evenmenu);
    renderEvenSpace();
}

var esConfig = {
    angle: 0,
    padding: 0.1,
    colors: []
}

function renderEvenSpace() {
    es_angle.innerText = `Angle: ${esConfig.angle}`;
    es_padding.innerText = `Padding: ${esConfig.padding}`
    es_colors.innerText = `Colors: ${esConfig.colors.length==0 ? "None" : esConfig.colors.join(", ")}`
}

async function evenspace_angleclick() {
    esConfig.angle = await getNumberInput("Enter new angle:", esConfig.angle);
    renderEvenSpace();
}

async function evenspace_paddingclick() {
    esConfig.padding = await getNumberInput("Enter padding:", esConfig.padding);
    renderEvenSpace();
}

async function evenspace_colorclick() {
    esConfig.colors = await getColorList(esConfig.colors);
    renderEvenSpace();
}

function generateES() {
    return `eval(Gradient.evenlySpaced([${esConfig.colors.map(c=>`"${c}"`).join(", ")}], ${esConfig.padding}).withAngle(${esConfig.angle}))`;
}

async function evenspace_done() {
    attemptSetAll(generateES());
}