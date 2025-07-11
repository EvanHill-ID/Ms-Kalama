import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Replit-friendly ES module support for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Initialize OpenAI with v4 SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  const systemMsg = `
You are roleplaying as Ms. Kalama, a warm, experienced instructional coach helping a teacher practice AI prompting.

Evaluate this user-written AI prompt and return a JSON object with:
- "feedback": short coaching advice (warm, specific, encouraging tone)
- "score": 1 (poor), 2 (somewhat successful), 3 (successful), or 4 (detailed, excellent)

Respond ONLY in JSON format with no extra words.

Prompt to evaluate:
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
    const json = JSON.parse(reply);
    res.json(json);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ feedback: "Sorry, something went wrong.", score: 0 });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Ms. Kalama is live at http://localhost:${port}`));
