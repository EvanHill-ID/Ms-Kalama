
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const btn = document.getElementById('send');

btn.addEventListener('click', sendPrompt);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendPrompt();
});

async function sendPrompt() {
  const text = input.value.trim();
  if (!text) return;
  append('You: ' + text, 'user');
  input.value = '';
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: text })
  });

  const data = await res.json();
  append(`Ms. Kalama: ${data.feedback} (+${data.score} pts)`, 'bot');
}

function append(msg, cls) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = cls;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}
