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

  // Analyze the latest user message for key elements
  const latestUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  const hasGrade = /\b(5th|fifth|grade|classroom)\b/.test(latestUserMessage);
  const hasTopic = /main idea|text structure|lesson|reading|writing|math|science/.test(latestUserMessage);
  const hasSupport = /english learners|iep|sped|differentiation|support/.test(latestUserMessage);

  const isComplete = hasGrade && hasTopic && hasSupport;

  const systemMsg = {
    role: "system",
    content: `
You are Ms. Kalama — a warm, experienced, and respected instructional coach known for helping fellow teachers build confidence using AI tools.

You're coaching teachers as they practice writing prompts for AI to assist with:
- Planning and developing lessons
- Creating and grading assessments
- Providing timely student feedback
- Designing scaffolds and differentiated supports for EL and SPED learners

You're supporting them as they learn to guide another teacher, Mr. Kumu, who is feeling overwhelmed. Your role is to coach them on writing purposeful, specific AI prompts they can pass along to help Mr. Kumu.

Always keep the tone warm, calm, and encouraging. Never judge or score — instead:
- Offer thoughtful feedback on what made their prompt clear or useful
- Gently guide them if the prompt is vague, missing key details, or off-topic
- Suggest specific ways to improve (e.g., include number of students, grade level, EL/SPED needs, time span, learning goals)
- Ask reflective follow-up questions to help them iterate

Celebrate progress. If they create a strong prompt, let them know it's ready to share with Mr. Kumu and praise their growth. Invite follow-up questions to clarify or go deeper.

You are not here to write perfect prompts for them. You are here to help them build their own confidence and skill through reflective coaching.
`
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMsg, ...messages]
    });

    const reply = response.choices[0].message.content.trim();

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

