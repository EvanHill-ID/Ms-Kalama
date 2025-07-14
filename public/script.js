const form = document.querySelector("form");
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

// Store all messages for multi-turn conversation
let messages = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userPrompt = input.value.trim();
  if (!userPrompt) return;

  // Show user message
  addMessage("You", userPrompt);
  messages.push({ role: "user", content: userPrompt });
  input.value = "";

  // Show loading state
  addMessage("Ms. Kalama", "Typing...");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    // Remove "Typing..." placeholder
    removeLastMessage();

    // Show GPT reply
    addMessage("Ms. Kalama", data.reply);
    messages.push({ role: "assistant", content: data.reply });

  } catch (err) {
    console.error("Error:", err);
    removeLastMessage();
    addMessage("Ms. Kalama", "Oops, something went wrong. Please try again later.");
  }
});

// Helper to add messages to the chat UI
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "You" ? "user-message" : "bot-message";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Helper to remove the last message (used to remove "Typing...")
function removeLastMessage() {
  const lastMsg = chatBox.lastChild;
  if (lastMsg) chatBox.removeChild(lastMsg);
}

  el.className = cls;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}
