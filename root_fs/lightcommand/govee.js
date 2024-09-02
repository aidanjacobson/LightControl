const request = require("request");

function setLight(light, color) {
    var postData = {
        requestId: randomRequestID().toString(),
        payload: {
            ...light.identifiers,
            capability: {
                type: "devices.capabilities.color_setting",
                instance: "colorRgb",
                value: convertColorToDecimal(color)
            }
        }
    }
    var url = "https://openapi.api.govee.com/router/api/v1/device/control";
    var options = {
        url: url,
        json: postData,
        headers: {
            "Content-Type": "application/json",
            "Govee-API-Key": process.env.govee_api_key
        }
    }
    return postAsync(options);
}

var lastID = 0;
function randomRequestID() {
    return lastID++;
}

function convertColorToDecimal({r, g, b}) {
    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | ((b & 0xFF) << 0);
}

function postAsync(options) {
    return new Promise((resolve, reject) => {
        request.post(options, ()=>{
            resolve()
        });
    })
}


module.exports = {setLight}