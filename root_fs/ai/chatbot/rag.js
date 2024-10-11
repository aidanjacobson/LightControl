const ai_control = require("../ai_control");

const generate_function_format = {
    "type": "function",
    "function": {
        "name": "generateScene",
        "description": "Generate a scene based on a user prompt, or modify an existing scene.",
        "parameters": {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "The prompt as text. You must generate the prompt for this function."
                },
                "scene": {
                    "type": "string",
                    "description": "The scene to modify. If not provided, a new scene will be generated."
                }
            },
            "required": ["prompt"]
        }
    }
}

const describe_function_format = {
    "type": "function",
    "function": {
        "name": "describeScene",
        "description": "Describe the given scene. Optionally you can request specific information with a prompt.",
        "parameters": {
            "type": "object",
            "properties": {
                "scene": {
                    "type": "string",
                    "description": "The scene to describe."
                },
                "prompt": {
                    "type": "string",
                    "description": "The prompt as text. You must generate the prompt for this function. If not provided, a general description will be given."
                }
            },
            "required": ["scene"]
        }
    }
}

const tools = [generate_function_format, describe_function_format];

async function generateScene(prompt, scene) {
    if (scene) {
        return (await ai_control.generateColorFromUserPrompt(prompt + "\nThe user has provided this scene to modify:\n" + scene)).color;
    } else {
        return (await ai_control.generateColorFromUserPrompt(prompt)).color;
    }
}

async function describeScene(scene, prompt) {
    if (prompt) {
        return (await ai_control.generateColorFromUserPrompt("Describe the following scene:\n" + scene + "\nThe user has requested specific information:\n" + prompt)).color;
    } else {
        return (await ai_control.generateColorFromUserPrompt("Describe the following scene:\n" + scene)).color;
    }
}

async function generateToolCallResponse(tool_call) {
    arguments = JSON.parse(tool_call.function.arguments);
    var response;
    switch(tool_call.function.name) {
        case "generateScene":
            response = await generateScene(arguments.prompt, arguments.scene);
            break;
        case "describeScene":
            response = await describeScene(arguments.scene, arguments.prompt);
            break;
    }
    return {
        role: "tool",
        content: response,
        tool_call_id: tool_call.id,
        time: Date.now()
    }
}

module.exports = {tools, generateScene, describeScene, generateToolCallResponse};