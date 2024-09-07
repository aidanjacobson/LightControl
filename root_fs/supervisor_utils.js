const request = require('request');
const remote = require("./remote");

const addon_slug = "local_lightcontrol";

function requestAsync(options) {
    return new Promise((resolve, reject) => {
        request.post(options, (e, res, body)=>{
            resolve(body)
        });
    })
}

async function rebuild() {
    if (! remote.isRemote()) {
        console.log("Cannot rebuild because not in remote container");
        return {status: "failure", reason: "Cannot rebuild because not in remote container"}
    }
    var options = {
        'method': 'POST',
        'url': `http://supervisor/addons/${addon_slug}/rebuild`,
        'headers': {
            'Authorization': `Bearer ${process.env.SUPERVISOR_API_TOKEN}`,
            'Content-Type': 'application/json',
        }
    };
    return {
        token: process.env.SUPERVISOR_API_TOKEN,
        response: await requestAsync(options)
    };
}

module.exports = {rebuild};