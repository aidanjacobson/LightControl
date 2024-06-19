var themedegree="red", themevariance=5;

async function getColorTheme() {
    switchToMenu(colorthememenu);
    renderColorTheme();
}

async function colortheme_done() {
    attemptSetAll(generateColorTheme(themedegree, themevariance));
}

function generateColorTheme(degree, variance) {
    var randomFunction = "HSLWeightedDist";
    if (settings.useNormalDistribution) randomFunction = "HSLNormalDist";
    return `eval(random.${randomFunction}("${degree}", ${variance}))`;
}

async function colortheme_degreesclick() {
    themedegree = await selectColor(themedegree);
    renderColorTheme();
}

async function colortheme_varianceclick() {
    themevariance = await getNumberInput("Enter Variance Percent:", themevariance);
    renderColorTheme();
}

function renderColorTheme() {
    colortheme_degrees.innerText = `Color: ${themedegree}`;
    colortheme_variance.innerText = `Variance: ${themevariance}`;
}