const request = require("request");
const urlJoin = require("./urljoin");
require("dotenv").config();

// obtain the url and access token for home assistant server
const access_token = process.env.hass_access_key;
const homeAssistantURL = process.env.homeassistant_url

/**
 * GET the Home Assistant API
 * @param {String} apiPath - the path to query the home assistant api, e.g. "/states/entityname"
 * @returns the JSON api response
 */
function get(apiPath) {
    var url = urlJoin(homeAssistantURL, "api", apiPath);
    var options = {
        url: url,
        headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json"
        }
    }
    return new Promise(function(resolve) {
        request.get(options, function(e, res, body) {
            resolve(JSON.parse(body));
        });
    });
}

/**
 * POST the Home Assistant API
 * @param {String} apiPath -  the path to query the home assistant api
 * @param {Object} data - The JSON payload to be serialized
 * @returns the JSON api response
 */
function post(apiPath, data) {
    var url = urlJoin(homeAssistantURL, "api", apiPath);
    var options = {
        url: url,
        json: data,
        headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json"
        }
    }
    return new Promise(function(resolve) {
        request.post(options, function(e, res, body) {
            resolve(body);
        });
    });
}

/**
 * Make a Home Assistant service call
 * @param {String} service - e.g. light.turn_on
 * @param {*} data - JSON service data
 * @returns Home Assistant API response
 */
async function serviceCall(service, data={}) {
    var [domain, serviceName] = service.split(".");
    var apiPath = `services/${domain}/${serviceName}`;
    //return await awaitOrTimeout(post(apiPath, data), 1000);
    return await post(apiPath, data);
}

module.exports = {get, post, serviceCall};