import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// This endpoint now handles full conversation history
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  const systemMsg = {
    role: "system",
    content: `
You are Ms. Kalama, a w

