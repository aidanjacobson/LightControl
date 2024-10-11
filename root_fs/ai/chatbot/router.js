const express = require('express');

const ai_chatbot = require('./ai_chatbot');

const apiRouter = express.Router();

apiRouter.post("/submitPrompt", async (req, res) => {
    const response = await ai_chatbot.submitUserPrompt(req.body.prompt);
    res.json(response);
});

apiRouter.get("/getMessages", async (req, res) => {
    res.json(ai_chatbot.getAllMessages());
});

apiRouter.post("/clearMessages", async (req, res) => {
    ai_chatbot.clearMessages();
    res.json({status: "success"});
});

module.exports = apiRouter;