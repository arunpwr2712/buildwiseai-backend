require("dotenv").config();
import express from "express";
import axios from "axios";
import cors from "cors";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";



const app = express();
app.use(cors());
app.use(express.json());

// Middleware to set headers
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});


// Route for template determination
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;

    // Call Python API to generate content
    try {
        const pythonResponse = await axios.post('https://buildwiseai-python-api.onrender.com/generate', {
            prompt: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`
        });
        // const pythonResponse = await axios.post('http://localhost:5000/generate', {
        //     prompt: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`
        // });

        const answer = pythonResponse.data.content.trim(); // node or react

        if (answer === "react") {
            res.json({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            });
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [nodeBasePrompt]
            });
            return;
        }

        res.status(403).json({ message: "You can't access this" });
    } catch (error: any) {
        console.error("Error calling Python API:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Chat Route
app.post("/chat", async (req, res) => {
    const messages= req.body.messages;

    // Combine all messages into a single prompt for the Python API
    const combinedPrompt = messages.map((msg: { content: any; }) => msg.content).join("\n");
    // Call Python API to generate chat response
    try {
        const pythonResponse = await axios.post('https://buildwiseai-python-api.onrender.com/generate', {
            prompt: combinedPrompt
        });
        // const pythonResponse = await axios.post('http://localhost:5000/generate', {
        //     prompt: combinedPrompt
        // });

        const responseContent = pythonResponse.data.content;

        res.json({ response: responseContent });
    } catch (error: any) {
        console.error("Error calling Python API:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }

});


app.listen(3000, () => {
    console.log("Node.js server running on http://localhost:3000");
});
