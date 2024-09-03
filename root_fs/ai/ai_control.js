require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs");

var client;
started = false;
if (process.env['OPENAI_API_KEY']) {
    client = new OpenAI();
    started = true;
}

async function generateColorFromUserPrompt(userPrompt) {
    if (!started) {
        return {status: "failed", reason: "No API Key"}
    }
    // console.log("Prompt: " + userPrompt);
    const systemMessage = {role: "system", content: fs.readFileSync(__dirname + "/system_prompt.txt", { encoding: 'utf8', flag: 'r' })};
    const userMessage = {role: "user", content: userPrompt};
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [systemMessage, userMessage],
            model: "gpt-4o"
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