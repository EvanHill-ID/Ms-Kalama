// script.js (Updated with message history + Storyline trigger)

document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat");

  // Store all messages for multi-turn conversation
  let messages = [];

  sendButton.addEventListener("click", async () => {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    addMessage("You", prompt);
    messages.push({ role: "user", content: prompt });
    userInput.value = "";
    addMessage("Ms. Kalama", "Typing...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      const data = await response.json();
      removeLastMessage();

      const combinedResponse = `<strong>Coaching:</strong> ${data.coaching}<br><br><strong>AI Output:</strong> ${data.output}`;
      addMessage("Ms. Kalama", combinedResponse);
      messages.push({ role: "assistant", content: data.output });

      if (data.complete === true) {
        try {
          if (typeof parent.SetPlayerVariable === "function") {
            parent.SetPlayerVariable("ChatComplete", true);
          }
        } catch (err) {
          console.warn("SetPlayerVariable failed (not in Storyline?):", err.message);
        }
      }

    } catch (error) {
      console.error("Error:", error);
      removeLastMessage();
      addMessage("Ms. Kalama", "Oops, something went wrong. Please try again.");
    }
  });

  function addMessage(sender, text) {
    const message = document.createElement("div");
    message.className = `message ${sender === "You" ? "user" : "bot"}`;
    message.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function removeLastMessage() {
    const lastMsg = chatBox.lastChild;
    if (lastMsg) chatBox.removeChild(lastMsg);
  }
});
