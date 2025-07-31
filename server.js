import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up server
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
    const lastUserPrompt = messages[messages.length - 1]?.content || "";

    console.log("User prompt received:", lastUserPrompt);

    // Prompt for coaching
    const coachingResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Ms. Kalama, a warm and knowledgeable instructional coach helping teachers write effective AI prompts. Respond only with clear, encouraging coaching about how to improve the user’s prompt."
        },
        ...messages
      ],
      max_tokens: 200
    });

    const coaching = coachingResponse.choices?.[0]?.message?.content || "";

    // Prompt for AI output simulation
    const outputResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI classroom assistant. Respond to the user's prompt with an actual classroom-ready response (e.g., a lesson plan, activity, or strategy). Be specific and skip coaching or explanation."
        },
        { role: "user", content: lastUserPrompt }
      ],
      max_tokens: 300
    });

    const aiOutput = outputResponse.choices?.[0]?.message?.content || "";

    res.json({
      reply: `<strong>Coaching:</strong> ${coaching}<br/><br/><strong>AI Output:</strong> ${aiOutput}`,
      complete: coaching.toLowerCase().includes("great prompt") ||
                coaching.toLowerCase().includes("well done")
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
