import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Initialize OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Conversational Ms. Kalama coaching logic
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  // Analyze latest user message
  const latestUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  const hasGrade = /\b(5th|fifth|grade|classroom)\b/.test(latestUserMessage);
  const hasTopic = /main idea|text structure|lesson|reading|writing|math|science|shakespeare/.test(latestUserMessage);
  const hasSupport = /english learners|elp|iep|sped|differentiation|support/.test(latestUserMessage);

  const isComplete = hasGrade && hasTopic && hasSupport;

  const systemMsg = {
    role: "system",
    content: `
You are Ms. Kalama — a warm, supportive instructional coach helping teachers practice writing better AI prompts.

✅ Keep responses SHORT and FRIENDLY: 2–3 sentences max.

Your job is to:
- Encourage the user in a warm, human tone
- Suggest **one specific improvement**, if needed
- Avoid long explanations or rewriting their prompt
- Do NOT ask follow-up questions or try to steer the user off-topic

If the prompt is vague or missing detail, use phrases like:
- “Try adding a bit more detail about the topic or learning goal.”
- “It would be good to include grade level and learner needs.”
- “Consider mentioning supports for EL or IEP students.”

If the prompt is already strong, affirm their work and let them know they’re ready to continue.
    `
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMsg, ...messages]
    });

    let reply = response.choices[0].message.content.trim();

    // Override with custom final message if prompt is strong
    if (isComplete) {
      reply = "This version is thoughtful and well-structured — great job! 📋 Don’t forget to copy or jot down this prompt. You’ll revisit it in your final reflection. Ready to move on? Click ‘Continue’ when you are.";
    }

    res.json({
      reply,
      complete: isComplete
    });

  } catch (err) {
    console.error("❌ OpenAI API error:", err.message);
    res.status(500).json({
      reply: "Oops! Something went wrong. Please try again shortly.",
      complete: false
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Ms. Kalama is live at http://localhost:${port}`);
});
