
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

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
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMsg }
      ]
    });

    const reply = response.data.choices[0].message.content;
    const json = JSON.parse(reply);
    res.json(json);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ feedback: "Sorry, something went wrong.", score: 0 });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is live at http://localhost:${port}`));
