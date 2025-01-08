"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Route for template determination
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    // Call Python API to generate content
    try {
        const pythonResponse = await axios_1.default.post('http://localhost:5000/generate', {
            prompt: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`
        });
        const answer = pythonResponse.data.content.trim(); // node or react
        if (answer === "react") {
            res.json({
                prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [react_1.basePrompt]
            });
            return;
        }
        if (answer === "node") {
            res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [node_1.basePrompt]
            });
            return;
        }
        res.status(403).json({ message: "You can't access this" });
    }
    catch (error) {
        console.error("Error calling Python API:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
// Chat Route
app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    // Combine all messages into a single prompt for the Python API
    const combinedPrompt = messages.map((msg) => msg.content).join("\n");
    // Call Python API to generate chat response
    try {
        const pythonResponse = await axios_1.default.post('http://localhost:5000/generate', {
            prompt: combinedPrompt
        });
        const responseContent = pythonResponse.data.content;
        res.json({ response: responseContent });
    }
    catch (error) {
        console.error("Error calling Python API:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
app.listen(3000, () => {
    console.log("Node.js server running on http://localhost:3000");
});
