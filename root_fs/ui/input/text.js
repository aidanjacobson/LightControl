function promptForText(question="", defaultText="") {
    switchToMenu(textinputmenu);
    textInputPrompt.innerText = question;
    textinput.value = defaultText;
    textinput.focus();
    textinput.select();
    return new Promise((resolve, reject) => {
        var resolved = false;
        textinput.onchange = function() {
            if (resolved) return;
            resolved = true;
            resolve(textinput.value);
            back();
        }
        textinput.onkeyup = function(e) {
            if (resolved) return;
            resolved = true;
            if (e.keyCode == 13) {
                resolve(textinput.value);
                back();
            }
        }
    })
}

function textinput_back(event) {
    event.stopPropagation();
    event.preventDefault();
    back();
}