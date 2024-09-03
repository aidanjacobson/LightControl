var lastAskAI = "";
async function doAIPrompt() {
    var userPrompt = await promptForText("Describe your scene to the AI:", lastAskAI);
    lastAskAI = userPrompt;
    await setAllAI(userPrompt);
}

async function setAllAI(userPrompt) {
    var aiResponse = await apiPost("/promptAI", {prompt: userPrompt});
    if (aiResponse.status == "failed") {
        alert(aiResponse.reason);
        return;
    }
    var color = aiResponse.color;
    await attemptSetAll(color);
}

askAI = setAllAI;