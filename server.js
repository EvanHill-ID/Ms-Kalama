import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const coachingResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Ms. Kalama, a warm and knowledgeable instructional coach helping teachers write effective AI prompts. Respond with short, positive coaching (1–2 sentences max) about how to improve or confirm their prompt. Avoid rambling or repetition. Be concise, clear, and supportive."
        },
        ...messages
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const coachingText = coachingResponse.choices?.[0]?.message?.content?.trim();

    const outputResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI classroom assistant. Respond to the user's prompt with a short, specific classroom-ready response (lesson plan, activity, or strategy). Limit to ~3 bullet points or a concise paragraph. Avoid extra explanation or repetition."
        },
        ...messages
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    const outputText = outputResponse.choices?.[0]?.message?.content?.trim();

    const complete = messages.length >= 5; // Set true after several turns

    res.json({ reply: `${coachingText}

------------------------------

ChatGPT Response:
${outputText}`, complete });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "Oops, something went wrong. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
