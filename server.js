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

    let reply = response.choices[0].message.content.trim();

    // Remove GPT formatting quirks like backticks or markdown
    reply = reply.replace(/^```json|^```|```$/g, '').trim();

    let json;
    try {
      json = JSON.parse(reply);
    } catch (err) {
      console.error("⚠️ GPT returned invalid JSON:", reply);
      json = {
        feedback: "Oops! I couldn’t quite make sense of your prompt. Try again with a bit more detail.",
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
