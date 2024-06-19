var Color;
function init(ColorClass) {
    Color = ColorClass;
}

const HSLToRGB = ({h, s, l}) => {
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
    return new Color(r, g, b);
};

const RGBToHSL = ({r, g, b}) => {
    var nr = r/255;
    var ng = g/255;
    var nb = b/255;
    var vmin = Math.min(nr, ng, nb),
        vmax = Math.max(nr, ng, nb),
        h, s, l = (vmax+vmin)/2;
    if (vmax === vmin) return [0, 0, l];
    const d = vmax - vmin;
    s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
    if (vmax === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
    if (vmax === ng) h = (nb - nr) / d + 2;
    if (vmax === nb) h = (nr - ng) / d + 4;
    h /= 6;
  
    return {h: h*360, s: s*100, l: l*100};
}

function mod360(n) {
    if (n >= 0) return n;
    return n + Math.ceil(-n/360)*360;
}

function HSL() {
    return function() {
        return HSLToRGB({h: randLinear(0, 360), s: 100, l: 50});
    }
}


function HSLWeightedDist(color, percent=100, sf=5) {
    var hsl = RGBToHSL(Color.from(color));
    return function() {
        var h = mod360(hsl.h+weightedRandom(percent, sf)*360);
        return HSLToRGB({h, s:hsl.s, l:hsl.l});
    }
}

function HSLNormalDist(color, stdev=1) {
    var hsl = RGBToHSL(Color.from(color));
    return function() {
        var rand = gaussianRandom(hsl.h, stdev);
        return HSLToRGB({h: mod360(rand), s: hsl.s, l: hsl.l});
    }
}

function randLinear(a,b) {
    var diff = b-a;
    return Math.random()*diff+a;
}

function weightedRandom(percent, sf) {
    function randomTransform(n) {
        //return percent/100*Math.exp(-sf*n);
        return percent/100*n;
    }
    var r = 1-Math.random()*2;
    if (r >= 0) {
        return randomTransform(r);
    } else {
        return -randomTransform(-r);
    }
}

function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}


module.exports = {init, HSL, HSLWeightedDist, HSLNormalDist, gaussianRandom, weightedRandom, HSLToRGB, RGBToHSL};