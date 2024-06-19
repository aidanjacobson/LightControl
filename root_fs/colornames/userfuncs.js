function randomLinearRGB(color1, color2) {
    var c1 = Color.from(color1);
    var c2 = Color.from(color2);
    return function(light) {
        return scaleBetweenColors(Math.random, 0, 1, c1, c2)
    }
}