import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            'You are Ms. Kalama, a wise, supportive instructional coach. You help teachers improve their AI prompts to be more useful for lesson planning, assessment, and differentiation. Your tone is encouraging and warm, like a mentor. If the user\'s prompt is strong — meaning it\'s specific, clear, and tailored to the classroom context — affirm it clearly and include this phrase in your response: "This is a strong prompt." If the prompt needs improvement, offer 1–2 supportive coaching tips to refine it. Help the teacher iterate thoughtfully, but do NOT say "This is a strong prompt" unless it truly meets the bar. Only include the strong prompt phrase ONCE per message, and only when it’s well deserved.',
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "gpt-4",
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ reply: "Sorry, I couldn't process that. Try again!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
