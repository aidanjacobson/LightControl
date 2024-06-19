process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

const {setAll, setLight} = require("./lightcommand/light");

const Color = require("./color");
const Gradient = require("./gradient");

const server = require("./server");