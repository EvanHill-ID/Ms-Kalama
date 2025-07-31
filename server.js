const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userPrompt = messages[messages.length - 1]?.content || "";

    // Request 1: Coaching-style feedback
    const coachingRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a supportive instructional coach helping teachers write better AI prompts. Give succinct coaching in 1-2 sentences and suggest improvements if needed." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
    });

    // Request 2: Sample AI output
    const outputRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are ChatGPT simulating a teacher using AI to complete their task. Respond with ~3 bullet points showing what an AI might output in response to the user's prompt." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
    });

    const coaching = coachingRes.choices?.[0]?.message?.content || "Here's a suggestion!";
    const output = outputRes.choices?.[0]?.message?.content || "No AI output generated.";

    res.json({
      coaching: coaching.trim(),
      output: output.trim(),
      complete: true,
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ coaching: "Sorry, something went wrong.", output: "", complete: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userPrompt = messages[messages.length - 1]?.content || "";

    // Request 1: Coaching-style feedback
    const coachingRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a supportive instructional coach helping teachers write better AI prompts. Give succinct coaching in 1-2 sentences and suggest improvements if needed." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
    });

    // Request 2: Sample AI output
    const outputRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are ChatGPT simulating a teacher using AI to complete their task. Respond with ~3 bullet points showing what an AI might output in response to the user's prompt." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
    });

    const coaching = coachingRes.choices?.[0]?.message?.content || "Here's a suggestion!";
    const output = outputRes.choices?.[0]?.message?.content || "No AI output generated.";

    res.json({
      coaching: coaching.trim(),
      output: output.trim(),
      complete: true,
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ coaching: "Sorry, something went wrong.", output: "", complete: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
