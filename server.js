import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userPrompt = messages[messages.length - 1]?.content || "";

    // Coaching message
    const coachingRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You're a warm instructional coach helping teachers improve AI prompts. Give a quick, kind tip or suggestion to improve their prompt, if needed." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
    });

    // AI Output message
    const outputRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are ChatGPT responding to the user's prompt as if generating output for a classroom use case. Respond with approximately 3 concise bullet points." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
    });

    const coaching = coachingRes.choices?.[0]?.message?.content?.trim() || "";
    const output = outputRes.choices?.[0]?.message?.content?.trim() || "";

    res.json({
      coaching,
      output,
      complete: true,
    });
  } catch (err) {
    console.error("Error in /chat route:", err);
    res.status(500).json({ coaching: "Sorry, something went wrong.", output: "", complete: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
