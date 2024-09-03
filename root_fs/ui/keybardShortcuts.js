window.addEventListener("keypress", function(event) {
    exclude = ['input', 'textarea'];
    source = event.target;
    var tagName = source.tagName.toLowerCase();
    var type = source.type;
    if (tagName == "textarea" || tagName == "input" && type == "text") {
        return;
    }

    if (event.key == "r") {
        attemptSetAll(lastColor);
    }
})