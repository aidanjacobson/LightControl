HTMLElement.prototype.show = function() {
    this.removeAttribute("hidden");
}

HTMLElement.prototype.hide = function() {
    this.setAttribute("hidden", true);
}

function switchTo(element, className="menu") {
    for (var menu of document.querySelectorAll("."+className)) {
        if (menu == element) {
            menu.show();
        } else {
            menu.hide();
        }
    }
}