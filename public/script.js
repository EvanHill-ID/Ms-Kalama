const form = document.querySelector("form");
const chatBox = document.getElementById("chat");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const continueBtn = document.getElementById("continue-btn");

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

    if (data.reply) {
      addMessage("Ms. Kalama", data.reply);
      messages.push({ role: "assistant", content: data.reply });

      // Storyline trigger if prompt is considered complete
      if (data.complete === true) {
        try {
          if (typeof parent.SetPlayerVariable === "function") {
            parent.SetPlayerVariable("ChatComplete", true);
          }
        } catch (err) {
          console.warn("SetPlayerVariable failed:", err.message);
        }
        continueBtn.style.display = "block";
      }
    } else if (data.error) {
      addMessage("Ms. Kalama", `Error: ${data.error}`);
    }
  } catch (err) {
    console.error("Client-side error:", err);
    removeLastMessage();
    addMessage("Ms. Kalama", `Error: ${err.message}`);
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
