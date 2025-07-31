// server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Store this securely
});
const openai = new OpenAIApi(configuration);

// System prompts
const COACHING_PROMPT = {
  role: "system",
  content:
    "You are Ms. Kalama, a warm and wise instructional coach who helps teachers refine their AI prompts. Your goal is to give brief, constructive coaching — ideally in 1–3 sentences — that encourages revision. Focus on clarity, specificity, and alignment with teaching goals. Do not generate any lesson plans or AI outputs. Offer 1 suggestion at a time and encourage iteration. Speak in a calm, supportive tone like a mentor."
};

const OUTPUT_PROMPT = {
  role: "system",
  content:
    "You are an AI assistant for teachers. Generate a realistic, classroom-ready result based on the user's prompt — such as a lesson plan, activity, or instructional strategy. Keep it professional and practical, and avoid coaching or suggestions."
};

// POST route to handle prompt input and return both coaching + output
app.post("/api/chat", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    // Call 1: Coaching from Ms. Kalama
    const coachingResponse = await openai.createChatCompletion({
      model: "gpt-4", // or gpt-3.5-turbo
      messages: [COACHING_PROMPT, { role: "user", content: userPrompt }],
    });

    const coachingText = coachingResponse.data.choices[0].message.content;

    // Call 2: AI output simulation
    const outputResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [OUTPUT_PROMPT, { role: "user", content: userPrompt }],
    });

    const outputText = outputResponse.data.choices[0].message.content;

    // Return both responses
    res.json({
      coaching: coachingText,
      output: outputText,
    });
  } catch (err) {
    console.error("Error with OpenAI API:", err.message);
    res.status(500).json({ error: "Something went wrong with the AI request." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ms. Kalama server running on port ${PORT}`);
});
