const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "user" ? "user-message" : "chatbot-message";
  messageDiv.innerText = text;
  chatContainer.appendChild(messageDiv);
  scrollToBottom();
}

async function sendMessage() {
  const input = userInput.value.trim();
  if (!input) return;

  addMessage("user", input);
  userInput.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    const reply = data.reply;
    addMessage("chatbot", reply);

    // If the response includes a strong prompt confirmation, show the copy prompt UI
    if (reply.toLowerCase().includes("this is a strong prompt")) {
      showSuccessMessage(input);
    }
  } catch (error) {
    console.error("Error:", error);
    addMessage("chatbot", "Oops! Something went wrong. Try again.");
  }
}

function showSuccessMessage(userPrompt) {
  const feedback = document.createElement("div");
  feedback.className = "chatbot-message";
  feedback.innerHTML = `
    ✅ <strong>This is a strong prompt!</strong><br>
    You can <button id="copyPromptBtn">📋 Copy Prompt</button> and then click <strong>Next</strong> in the course to move on.<br>
    If you'd like to refine further, you're welcome to keep going!
  `;

  chatContainer.appendChild(feedback);
  scrollToBottom();

  // Enable copying the final prompt
  const copyButton = document.getElementById("copyPromptBtn");
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(userPrompt).then(() => {
      alert("Prompt copied to clipboard!");
    });
  });
}

// Listeners
sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
