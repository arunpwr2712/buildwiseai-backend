"use strict";
// // Make sure to include these imports:
// import axios from "axios";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const prompt = "Write a story about a magic backpack.";
// const result = await model.generateContent(prompt);
// console.log(result.response.text());
// import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
// async function generateStory() {
//     const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(process.env.API_KEY as string);
//     const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const prompt: string = "Write a story about a magic backpack.";
//     const result = await model.generateContent(prompt);
//     console.log(result.response.text);
// }
// generateStory();
const express_1 = __importDefault(require("express"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Load environment variables from .env file
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Welcome to the Generative AI Story API. Use POST /generate-story to generate a story.");
});
app.post("/generate-story", async (req, res) => {
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = req.body.prompt || "Write a story about a magic backpack.";
        const result = await model.generateContent(prompt);
        res.status(200).json({ story: result.response.text });
    }
    catch (error) {
        console.error("Error generating story:", error);
        res.status(500).json({ error: "An error occurred while generating the story." });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
