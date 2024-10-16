var localMessages = [];

window.addEventListener('load', async function() {
    await pullLocalMessages();
    renderMessages();
});

async function pullLocalMessages() {
    var remoteMessages = await apiGet('/ai/getMessages');
    
    // compare the local and remote messages, add any new messages to the local messages
    // compare content and time to determine if the messages are the same
    // for (var remoteMessage of remoteMessages) {
    //     var localMessage = localMessages.find(message => message.content == remoteMessage.content && message.time == remoteMessage.time);
    //     if (!localMessage) {
    //         localMessages.push(remoteMessage);
    //     }
    // }

    localMessages = remoteMessages;

    // sort the local messages by time
    localMessages.sort((a, b) => a.time - b.time);
}

function renderMessages() {
    // clear all main messages
    // loop through messages and render them
    // skip any messages with role "tool" or non-null tool_calls
    const mainMessages = document.getElementById('mainMessages');
    mainMessages.innerHTML = '';

    for (let message of localMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message');
        var contentElements = [];

        if (message.role === 'user') {
            messageDiv.classList.add('user-message');
            
            const messageSpan = document.createElement('span');
            messageSpan.textContent = message.content;
            contentElements.push(messageSpan);
        } else if (message.role === 'assistant' && !message.tool_calls) {
            messageDiv.classList.add('assistant-message');
            contentElements = createContentElements(message.content);
        } else if (message.role === 'assistant' && message.tool_calls) {
            if (!verboseMode) {
                continue;
            }
            messageDiv.classList.add('tool-call');
            for (let toolCall of message.tool_calls) {
                const contentSpan = document.createElement('span');
                contentSpan.textContent = `Tool Call: ${generateToolCallInfo(toolCall.function.name, JSON.parse(toolCall.function.arguments))}\n\n`;
                contentElements.push(contentSpan);
            }
        } else if (message.role === 'tool') {
            if (!verboseMode) {
                continue;
            }
            messageDiv.classList.add('tool-response');
            const contentSpan = document.createElement('span');
            contentSpan.textContent = `Tool response\n\n${message.content}`;
            contentElements.push(contentSpan);
        }

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('chatbot-message-content');

        // const contentElements = createContentElements(message.content);

        messageContentDiv.append(...contentElements);
        
        messageDiv.appendChild(messageContentDiv);
        mainMessages.appendChild(messageDiv);
    }
}

function generateToolCallInfo(name, arguments) {
    if (name == "generateScene") {
        if (arguments.scene && arguments.scene != "") {
            return `\nGenerate Scene\nPrompt: ${arguments.prompt}\nScene: ${arguments.scene}`;
        } else {
            return `\nGenerate Scene\nPrompt: ${arguments.prompt}`;
        }   
    } else if (name == "describeScene") {
        if (arguments.prompt && arguments.prompt != "") {
            return `\nDescribe Scene\nScene: ${arguments.scene}\nPrompt: ${arguments.prompt}`;
        } else {
            return `\nDescribe Scene\nScene: ${arguments.scene}`;
        }
    }
}

function createContentElements(content) {
    var sections = content.split("###");
    var outElements = [];
    for (var i = 0; i < sections.length; i++) {
        var sectionPurposeIndex = i % 3;
        if (sectionPurposeIndex == 0) {
            if (sections[i].trim() === '') {
                continue;
            }
            const messageSpan = document.createElement('span');
            messageSpan.textContent = sections[i];
            outElements.push(messageSpan);
        } else if (sectionPurposeIndex == 1) {
            const scene = sections[i];
            i++;
            const text = sections[i];

            const executableSpan = document.createElement('div');
            executableSpan.classList.add('color-executable');
            executableSpan.textContent = text;
            executableSpan.setAttribute('data-scene', scene);
            executableSpan.title = scene;

            executableSpan.addEventListener('click', colorExecutableClick);
            executableSpan.addEventListener('touchstart', executeTouchStart);
            executableSpan.addEventListener('touchend', executeTouchEnd);
            executableSpan.addEventListener('touchmove', trackTouchMove);

            outElements.push(executableSpan);
        }
    }
    return outElements;
}

async function colorExecutableClick(event) {
    const scene = event.target.getAttribute('data-scene');
    await apiSetAll(scene);
}

var canSendMessage = true;
async function sendMessage() {
    if (!canSendMessage) {
        return;
    }

    // get the text from the input
    var textInput = document.getElementById('chatbot-input-text');
    var text = textInput.value;

    // create a new temporary user message
    const mainMessages = document.getElementById('mainMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chatbot-message', 'user-message');

    const messageContentDiv = document.createElement('div');
    messageContentDiv.classList.add('chatbot-message-content');

    const messageSpan = document.createElement('span');
    messageSpan.textContent = text;

    messageContentDiv.appendChild(messageSpan);
    messageDiv.appendChild(messageContentDiv);
    mainMessages.appendChild(messageDiv);

    if (text === '/clear') {
        await apiPost('/ai/clearMessages');
        location.reload();
        return;
    }

    // show the typing indicator and disable sending messages
    typingMessage.style.display = 'flex';
    canSendMessage = false;
    textInput.value = '';

    // send the message to the server
    await apiPost('/ai/submitPrompt', { prompt: text });

    // pull the messages from the server
    await pullLocalMessages();

    // hide the typing indicator and enable sending messages
    typingMessage.style.display = 'none';
    canSendMessage = true;

    // render the messages
    renderMessages();
}

window.addEventListener("load", function() {
    document.getElementById('chatbot-input-text').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
})

if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

function analyzeMessages() {
    var messagesOut = [];
    for (let message of localMessages) {
        if (message.role == "user") {
            messagesOut.push(`User: ${message.content}`);
        } else if (message.role == "assistant" && !message.tool_calls) {
            messagesOut.push(`Assistant: ${message.content}`);
        } else if (message.role == "assistant" && message.tool_calls) {
            for (let toolCall of message.tool_calls) {
                messagesOut.push(`Tool Call: ${toolCall.function.name}, Arguments: ${toolCall.function.arguments}`);
            }
        } else if (message.role == "tool") {
            messagesOut.push(`Tool response: ${message.content}`);
        }
    }
    return messagesOut;
}

window.addEventListener('load', function() {
    const textInput = document.getElementById('chatbot-input-text');
    textInput.focus();

    textInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    window.addEventListener('keydown', function() {
        textInput.focus();
    });
});

let touchStartTime;
const longTouchDuration = 500; // 1 second

let touchFinished = false;

function executeTouchStart(event) {
    if (event.touches && event.touches.length > 0) {
        lastTouchMovePosition.x = event.touches[0].clientX;
        lastTouchMovePosition.y = event.touches[0].clientY;
    }

    if (event.target.classList.contains('color-executable')) {
        touchStartTime = Date.now();
        touchFinished = false;

        const touchTimeout = setTimeout(() => {
            if (!touchFinished) {
                const targetRect = event.target.getBoundingClientRect();
                if (
                    lastTouchMovePosition.x >= targetRect.left &&
                    lastTouchMovePosition.x <= targetRect.right &&
                    lastTouchMovePosition.y >= targetRect.top &&
                    lastTouchMovePosition.y <= targetRect.bottom
                ) {
                    const dataScene = event.target.getAttribute('data-scene');
                    // alert(dataScene);
                    navigator.clipboard.writeText(dataScene);
                }
            }
        }, longTouchDuration);
    }
}

let lastTouchMovePosition = { x: 0, y: 0 };

function trackTouchMove(event) {
    if (event.touches && event.touches.length > 0) {
        lastTouchMovePosition.x = event.touches[0].clientX;
        lastTouchMovePosition.y = event.touches[0].clientY;
    }
}

function executeTouchEnd(event) {
    if (event.target.classList.contains('color-executable')) {
        touchFinished = true;
    }
}

var verboseMode = false
async function toggleVerboseMode() {
    await pullLocalMessages();
    const button = document.getElementById('toggle-verbose-button');
    button.classList.toggle('verbose');
    verboseMode = !verboseMode;
    renderMessages();
}

// every 1 second, pull the messages from the server
setInterval(async function() {
    const previousMessages = JSON.stringify(localMessages);
    await pullLocalMessages();
    const currentMessages = JSON.stringify(localMessages);
    if (previousMessages !== currentMessages) {
        renderMessages();
    }
}, 1000);