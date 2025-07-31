const form = document.querySelector("form");
const chatBox = document.getElementById("chat-container");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-button");

let messages = [];

sendBtn.addEventListener("click", async () => {
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

    const combinedReply = `${data.coaching.trim()}<br><br><strong>ChatGPT Response:</strong> ${data.output.trim()}`;
    addMessage("Ms. Kalama", combinedReply);

    messages.push({ role: "assistant", content: data.coaching + "\n\n" + data.output });

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

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "You" ? "user-message" : "bot-message";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLastMessage() {
  const lastMsg = chatBox.lastChild;
  if (lastMsg) chatBox.removeChild(lastMsg);
}
