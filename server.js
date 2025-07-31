import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST route for chat
app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages || [];
    const userPrompt = messages[messages.length - 1]?.content;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing user prompt." });
    }

    // Get coaching feedback
    const coachingResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Ms. Kalama, an instructional coach helping teachers improve their AI prompts. Give succinct, specific, and positive coaching to help refine prompts for clarity, grade level, task type, and student needs. Respond in 2-3 sentences.",
        },
        ...messages,
      ],
    });

    const coaching = coachingResponse.choices[0].message.content.trim();

    // Get example AI output
    const outputResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant responding to the prompt as an educational tool would. Provide a sample lesson plan, quiz, or strategy based on the prompt. Keep it short and in plain language.",
        },
        { role: "user", content: userPrompt },
      ],
    });

    const output = outputResponse.choices[0].message.content.trim();

    const combinedReply = `<strong>Coaching:</strong> ${coaching}<br><br><strong>AI Output:</strong> ${output}`;

    res.json({ reply: combinedReply, complete: true });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ms. Kalama is listening on port ${PORT}`);
});
