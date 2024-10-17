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

const max_allowed_messages = 30;

// function to remove messages that are more than 20 minutes or 15 messages old
function pruneMessages() {
    // keep only the last max_allowed_messages
    // messageHistory = messageHistory.slice(-max_allowed_messages);
    filteredMessages = messageHistory.slice(-max_allowed_messages);
    
    while (true) {
        if (filteredMessages.length > 0 && (filteredMessages[0].role == "tool" || filteredMessages[0].role == "assistant")) {
            filteredMessages.splice(0, 1);
        } else {
            break;
        }
    }
    return filteredMessages;
}

async function submitUserPrompt(prompt) {
    // create a new user message
    var userMessage = {
        role: "user",
        content: prompt
    };
    
    // add the user message to the message history
    messageHistory.push(userMessage);
    await generateNextResponse();
    
    return filteredMessages;
}

async function generateNextResponse() {

    // create a new system message
    var systemMessage = createSystemMessage();

    // create a new list of messages, concatenating the system message and the user messages
    var allMessages = [systemMessage, ...pruneMessages()];

    var chatCompletion;
    try {
        // submit the messages to the OpenAI API
        chatCompletion = await client.chat.completions.create({
            messages: allMessages,
            model: model,
            temperature: model_temp,
            tools: rag.tools
        });
    } catch (error) {
        console.error(error);
        console.log(allMessages);
        return;
    }

    const completion_reason = chatCompletion.choices[0].finish_reason;
    const completion_message = chatCompletion.choices[0].message;
    
    // if the ai used a tool call, get the response to the tool call, append all messages, and generate the next response
    if (completion_reason == "tool_calls") {
        messageHistory.push(completion_message);
        // const tool_call = completion_message.tool_calls[0];
        for (const tool_call of completion_message.tool_calls) {
            const response_message = await rag.generateToolCallResponse(tool_call);
            messageHistory.push(response_message);
        }
        await generateNextResponse();
    } else {
        messageHistory.push(completion_message);
    }
}

function convertMessagesToResponse() {
    // return messages.filter(message => message.role == "user" || (message.role == "assistant" && ndef(message.tool_calls))).map(({content, role})=>({content, role}));
    return messageHistory;
}

function clearMessages() {
    messageHistory = [];
}

module.exports = {submitUserPrompt, getAllMessages: convertMessagesToResponse, clearMessages};