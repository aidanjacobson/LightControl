function el(name) {
    return document.createElement(name);
}

HTMLElement.prototype.prop = function(key, value) {
    if (typeof value !== "undefined") {
        if (value === null) {
            this.removeAttribute(key);
        } else {
            this.setAttribute(key, value);
        }
        return this;
    } else {
        return this.getAttribute(key);
    }
}

HTMLInputElement.prototype.setType = function(type) {
    this.type = type;
    return this;
}

HTMLInputElement.prototype.val = function(value) {
    this.value = value;
    return this;
}

HTMLElement.prototype.click = function(c) {
    this.addEventListener("click", c);
    return this;
}

HTMLInputElement.prototype.change = function(c) {
    this.addEventListener("change", c);
    return this;
}

HTMLElement.prototype.text = function(t) {
    this.innerText = t;
    return this;
}

function makeTD(...elements) {
    var td = document.createElement("td");
    td.append(...elements);
    return td;
}

function copyClipboard(text) {
    navigator.clipboard.writeText(text);
}