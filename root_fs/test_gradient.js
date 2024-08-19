var fpWidth = 2836
var fpHeight = 4351

function mod360(n) {
    if (n >= 0) return n % 360;
    return n + Math.ceil(-n/360)*360;
}

function create(degrees) {
    degrees = utils.mod360(degrees);
    var rads = degrees/180*Math.PI;
    var m = Math.tan(rads);
    var w = fpWidth/2;
    var h = fpHeight/2;
    var wf = (degrees >= 0 && degrees < 90) || (degrees >= 180 && degrees < 270) ? 1 : -1;
    var pf = (degrees >= 0 && degrees < 90) || (degrees >= 270 && degrees < 360) ? 1 : -1;

    var gradientLineEndX = (w + wf*h*m) / (m*m + 1);
    var gradientLineEndY = m * gradientLineEndX;
    // var gradientLineVectorLength = Math.sqrt(Math.pow(gradientLineEndX, 2) + Math.pow(gradientLineEndY, 2));
    var gradientLineVectorLength = utils.distance(gradientLineEndX, gradientLineEndY)
    var gradientLineUnitX = gradientLineEndX / gradientLineVectorLength;
    var gradientLineUnitY = gradientLineEndY / gradientLineVectorLength;
    return function(x, y) {
        var translatedX = x - w;
        var translatedY = y - h;
        var gradientLineDotProduct = translatedX * gradientLineUnitX + translatedY * gradientLineUnitY;
        var fromNegativeOneToOne = gradientLineDotProduct / gradientLineVectorLength;
        var percent = ((pf * fromNegativeOneToOne) + 1) / 2;
    }
}