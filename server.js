import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set in Render environment variables
});

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

app.post("/api/chat", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const [coachingResponse, outputResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [COACHING_PROMPT, { role: "user", content: userPrompt }],
      }),
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [OUTPUT_PROMPT, { role: "user", content: userPrompt }],
      }),
    ]);

    res.json({
      coaching: coachingResponse.choices[0].message.content,
      output: outputResponse.choices[0].message.content,
    });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({ error: "Something went wrong with the AI request." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ms. Kalama server running on port ${PORT}`);
});
