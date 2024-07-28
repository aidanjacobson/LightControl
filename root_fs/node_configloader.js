var request = require("request");
require("dotenv").config();

/*
options {
    securityKey?: String,
    store: String
}
*/

function ConfigLoader(options) {
    var endpoint = process.env.configloader_url;
    var storageEndpoint, validateEndpoint, pingEndpoint, listEndpoint, deleteEndpoint;
    if (!options.securityKey) options.securityKey = process.env.config_access_key;
    var setEndpoints = function(endpointNew) {
        endpoint = endpointNew;
        storageEndpoint = endpoint + "/store/" + options.store;
        validateEndpoint = endpoint + "/validate/" + options.securityKey;
        pingEndpoint = endpoint + "/ping";
        listEndpoint = endpoint + "/list"
        deleteEndpoint = endpoint + "/delete"
    }
    setEndpoints(endpoint);
    var _this = this;
    _this.config = {};
    _this.validate = async function() {
        validateEndpoint = endpoint + "/validate/" + options.securityKey;
        var response = await xhrGet(validateEndpoint);
        return response.valid;
    }
    var xhrGet = function(url) {
        return new Promise(function(resolve, reject) {
            var requestOptions = {
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    "Security-key": options.securityKey
                }
            }
            request.get(requestOptions, function(e, res, body) {
                if (typeof body == "undefined" || body == "undefined") {
                    resolve();
                } else {
                    resolve(JSON.parse(body));
                }
            })
        });
    }
    var xhrPost = function(url, data) {
        return new Promise(function(resolve, reject) {
            var requestOptions = {
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    "Security-key": options.securityKey
                },
                json: data
            }
            request.post(requestOptions, function(e, res, body) {
                resolve();
            })
        });
    }
    _this.downloadConfig = async function() {
        // console.log(storageEndpoint, await xhrGet(storageEndpoint))
        _this.config = await xhrGet(storageEndpoint);
        return _this.config;
    }
    _this.uploadConfig = async function() {
        if (options.store == "") return;
        await xhrPost(storageEndpoint, _this.config);
    }

    _this.ping = async function() {
        return await xhrGet(pingEndpoint);
    }

    _this.listStores = async function() {
        return await xhrGet(listEndpoint);
    }

    _this.deleteStore = async function(storeName) {
        return (await xhrGet(deleteEndpoint + "/" + storeName)).status == "success";
    }
}

module.exports = ConfigLoader;