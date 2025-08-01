import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userPrompt = messages[messages.length - 1]?.content || "";

    // Coaching message
    const coachingRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You’re Ms. Kalama, a warm instructional coach helping teachers improve AI prompts. Keep your coaching brief and focused. Respond in 2–4 sentences only. Praise strong prompts and suggest 1–2 specific tips for improvement when needed."
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
    });

    // AI Output message
    const outputRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are ChatGPT responding to the user's prompt as if generating output for a classroom use case. Respond in no more than 3 concise bullet points. Each bullet should be short and to the point. Keep the entire response under 400 tokens."
        },
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
