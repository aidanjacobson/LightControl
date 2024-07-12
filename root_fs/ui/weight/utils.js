const PI = Math.PI;
const TAU = Math.PI*2;

function dist(x1, y1, x2, y2) {
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;
    return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
}

const HSLToRGB = ([h, s, l]) => {
    h = mod360(h);
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    //return {r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4))};
    const r = 255 * f(0);
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4))
    return [r, g, b]
};

function mod360(n) {
    if (n >= 0) return n % 360;
    return n + Math.ceil(-n/360)*360;
}

function getDegreesToPoint(x, y, originX=0, originY=0) {
    var deltaY = y - originY;
    var deltaX = x - originX;
    var radians = Math.atan2(deltaY, deltaX);
    var degrees = rad2deg(radians);
    return degrees;
}

function deg2rad(deg) {
    return deg/180*PI;
}

function rad2deg(rad) {
    return rad*180/PI;
}

function imageLoad(img) {
    if (img.complete) return;
    return new Promise((resolve, reject) => {
        img.addEventListener("load", function() {
            resolve();
        })
    })
}

function getPointOnCircleWithDegrees(degrees, radius=circleRadius) {
    var x = Math.cos(deg2rad(degrees)) * radius;
    var y = Math.sin(deg2rad(degrees)) * radius;
    return [x, y];
}

function translateFrom([x, y], [dx, dy]) {
    return [x+dx, y+dy];
}

function translateBack([x, y], [dx, dy]) {
    return [x-dx, y-dy];
}

HTMLElement.prototype.hide = function() {
    this.setAttribute("hidden", true);
}

HTMLElement.prototype.show = function() {
    this.removeAttribute("hidden");
}