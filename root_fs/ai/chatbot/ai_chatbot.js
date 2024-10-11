const OpenAI = require("openai");
const fs = require("fs");
const rag = require("./rag");
const {def, ndef} = require("../../def_ndef");

const model = "gpt-4o-mini";
const model_temp = 1.5;

const client = new OpenAI();

function createSystemMessage() {
    return {
        role: "system",
        content: fs.readFileSync(__dirname + "/prompt.txt", { encoding: 'utf8', flag: 'r' })
    };
}

var messageHistory = [];

const max_message_age_minutes = 20;
const max_allowed_messages = 15;

// function to remove messages that are more than 20 minutes or 15 messages old
function pruneMessages() {
    // keep only the last max_allowed_messages
    messageHistory = messageHistory.slice(-max_allowed_messages);

    // of the remaining, keep only the ones that have message.time timestamp less than max_message_age_minutes old
    const now = Date.now();
    messageHistory = messageHistory.filter(message => now - message.time < max_message_age_minutes * 60 * 1000);

    if (messageHistory[0].role == "tool") {
        messageHistory.splice(0, 1);
    }
}

async function submitUserPrompt(prompt) {
    // create a new user message
    var userMessage = {
        role: "user",
        content: prompt,
        time: Date.now()
    };
    
    // add the user message to the message history
    messageHistory.push(userMessage);
    await generateNextResponse();
    
    return convertMessagesToResponse(messageHistory);
}

async function generateNextResponse() {
    // prune old messages
    pruneMessages();

    // create a new system message
    var systemMessage = createSystemMessage();

    // create a new list of messages, concatenating the system message and the user messages
    var allMessages = [systemMessage, ...messageHistory];

    // submit the messages to the OpenAI API
    const chatCompletion = await client.chat.completions.create({
        messages: allMessages,
        model: model,
        temperature: model_temp,
        tools: rag.tools
    });

    const completion_reason = chatCompletion.choices[0].finish_reason;
    const completion_message = chatCompletion.choices[0].message;
    completion_message.time = Date.now();
    
    // if the ai used a tool call, get the response to the tool call, append all messages, and generate the next response
    if (completion_reason == "tool_calls") {
        const tool_call = completion_message.tool_calls[0];
        const response_message = await rag.generateToolCallResponse(tool_call);
        messageHistory.push(completion_message);
        messageHistory.push(response_message);
        await generateNextResponse();
    } else {
        messageHistory.push(completion_message);
    }
}

function convertMessagesToResponse(messages) {
    // return messages.filter(message => message.role == "user" || (message.role == "assistant" && ndef(message.tool_calls))).map(({content, role})=>({content, role}));
    return messages;
}

module.exports = {submitUserPrompt, getAllMessages: convertMessagesToResponse};