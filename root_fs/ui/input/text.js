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
            back();
            resolve(textinput.value);
        }
        textinput.onkeyup = textinput.onkeypress = function(e) {
            if (e.keyCode == 13) {
                if (resolved) return;
                resolved = true;
                back();
                resolve(textinput.value);
            }
        }
    })
}

function textinput_back(event) {
    event.stopPropagation();
    event.preventDefault();
    back();
}