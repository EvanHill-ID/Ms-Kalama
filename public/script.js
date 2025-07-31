const form = document.querySelector("form");
const chatBox = document.getElementById("chat-container");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

let messages = [];

sendButton.addEventListener("click", async () => {
  const userPrompt = input.value.trim();
  if (!userPrompt) return;

  addMessage("You", userPrompt);
  messages.push({ role: "user", content: userPrompt });
  input.value = "";

  addMessage("Ms. Kalama", "Typing...");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    removeLastMessage();

    // Format response to bold "ChatGPT Response:" and show spacing
    const formatted = data.reply.replace(
      /ChatGPT Response:/,
      "<br><br><strong>ChatGPT Response:</strong>"
    );

    addMessage("Ms. Kalama", formatted);
    messages.push({ role: "assistant", content: data.reply });

    if (data.complete === true) {
      try {
        if (typeof parent.SetPlayerVariable === "function") {
          parent.SetPlayerVariable("ChatComplete", true);
        }
      } catch (err) {
        console.warn("SetPlayerVariable failed (not in Storyline?):", err.message);
      }
    }

  } catch (err) {
    console.error("Error:", err);
    removeLastMessage();
    addMessage("Ms. Kalama", "Oops, something went wrong. Please try again.");
  }
});

// Helper to add messages to the chat UI
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "You" ? "user-message" : "bot-message";
  
  // Convert line breaks to <br> for HTML rendering
  const formattedText = text.replace(/\n/g, "<br>");
  msg.innerHTML = `<strong>${sender}:</strong> ${formattedText}`;
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove the last message (e.g. Typing...)
function removeLastMessage() {
  const lastMsg = chatBox.lastChild;
  if (lastMsg) chatBox.removeChild(lastMsg);
}
