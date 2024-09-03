function promptForText(question="", defaultText="") {
    switchToMenu(textinputmenu);
    textInputPrompt.innerText = question;
    textinput.value = defaultText;
    textinput.focus();
    textinput.select();
    return new Promise((resolve, reject) => {
        textinput.onchange = function() {
            resolve(textinput.value);
            back();
        }
        textinput.onkeyup = function(e) {
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