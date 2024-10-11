const express = require('express');

const ai_chatbot = require('./ai_chatbot');

const apiRouter = express.Router();

apiRouter.post("/submitPrompt", async (req, res) => {
    const response = await ai_chatbot.submitUserPrompt(req.body.prompt);
    res.json(response);
});

module.exports = apiRouter;