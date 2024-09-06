require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs");
const colorNames = require("../colornames/colornames");

const model = "gpt-4o-mini";

var client;
started = false;
if (process.env['OPENAI_API_KEY']) {
    client = new OpenAI();
    started = true;
}

async function createSystemMessages() {
    return [{
        role: "system",
        content: fs.readFileSync(__dirname + "/system_prompt.txt", { encoding: 'utf8', flag: 'r' })
    }, {
        role: "system",
        content: `The user has also created a JSON file with many saved scenes. This file is imported below.
        These are many examples of what you can produce.
        You can output these names directly as well if they would be a good fit for the current request. Here they are:
        ${JSON.stringify(await colorNames.getColors())}`
    }];

}

async function generateColorFromUserPrompt(userPrompt) {
    if (!started) {
        return {status: "failed", reason: "No API Key"}
    }
    // console.log("Prompt: " + userPrompt);
    var systemMessages = await createSystemMessages();
    const userMessage = {role: "user", content: userPrompt};
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [...systemMessages, userMessage],
            model: model
        })
        var response = chatCompletion.choices[0].message.content;
        if (response.indexOf("```") > -1) {
            response = response.split("```")[1];
        }
        // console.log("AI says: " + out);
        return {status: "success", color: response};
    } catch(e) {
        return {status: "failed", reason: "RateLimitError"}
    }
}

module.exports = {generateColorFromUserPrompt}