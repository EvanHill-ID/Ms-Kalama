import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Initialize OpenAI SDK (v4)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  const systemMsg = `
You are roleplaying as Ms. Kalama, a warm, experienced instructional coach helping a teacher practice AI prompting.

You must respond ONLY with a valid JSON object. Do not say anything else. No commentary. No markdown. No quotes around the object. No explanation.

Correct format:
{
  "feedback": "Short, supportive coaching message",
  "score": 1
}

Rules:
- Do NOT explain anything.
- Do NOT say “Sure, here’s the JSON:”.
- Do NOT add markdown (like \`\`\`json).
- Do NOT include ANY other output — ONLY the JSON.

If the prompt is vague, assign a score of 1 or 2.
If it is clear and detailed, assign a score of 3 or 4.

PROMPT TO EVALUATE:
"""${prompt}"""
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMsg }
      ]
    });

    const reply = response.choices[0].message.content;

    let json;
    try {
      json = JSON.parse(reply);
    } catch (err) {
      console.error("⚠️ GPT returned invalid JSON:", reply);
      json = {
        feedback: "Oops! I couldn’t quite make sense of your prompt. Try adding more detail?",
        score: 1
      };
    }

    res.json(json);
  } catch (err) {
    console.error("❌ OpenAI API error:", err.message);
    res.status(500).json({
      feedback: "Sorry, something went wrong on the server.",
      score: 0
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Ms. Kalama is live at http://localhost:${port}`));


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Ms. Kalama is live at http://localhost:${port}`));

