import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules compatibility (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Initialize OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Handle full conversation flow
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  const systemMsg = {
    role: "system",
    content: `
You are Ms. Kalama, a warm and experienced instructional coach who helps teachers improve their AI prompting skills.

Your goal is to:
- Offer warm, constructive coaching
- Help refine prompts to be more specific, useful, and aligned with teaching needs
- Avoid scoring or grading — focus only on thoughtful, qualitative feedback
- Encourage follow-up and iterative improvement

Stay in character as a wise, supportive mentor. Be encouraging and realistic. No fluff.
`
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMsg, ...messages]
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply });

  } catch (err) {
    console.error("❌ OpenAI API error:", err.message);
    res.status(500).json({
      reply: "Oops! Something went wrong. Please try again shortly."
    });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Ms. Kalama is live at http://localhost:${port}`);
});
