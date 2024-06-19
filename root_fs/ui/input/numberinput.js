var numberResolveFunc = ()=>{};
function getNumberInput(textToShow="", defaultValue="") {
    switchToMenu(numberinput);
    numberInputPrompt.innerText = textToShow;
    numberinputelement.value = defaultValue;
    numberinputelement.focus();
    numberinputelement.select();
    return new Promise(function(resolve) {
        numberResolveFunc = resolve;
        numberinputelement.onchange = function() {
            back();
            numberResolveFunc(+numberinputelement.value)
        }
        numberinputelement.onkeyup = function(e) {
            if (e.keyCode == 13) {
                back();
                numberResolveFunc(+numberinputelement.value)
            }
        }
    })
}