const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const continueButton = document.getElementById("continue-btn");

function appendMessage(role, content) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", role);
  messageDiv.innerHTML = `<strong>${role === "user" ? "You" : "Ms. Kalama"}:</strong> ${content}`;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendOutput(content) {
  const outputDiv = document.createElement("div");
  outputDiv.classList.add("message", "output");
  outputDiv.innerHTML = `<strong>Sample AI Output:</strong><br>${content}`;
  chatContainer.appendChild(outputDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendCopyButton(promptText) {
  let existingButton = document.getElementById("copy-button");
  if (existingButton) {
    existingButton.remove();
  }

  const copyButton = document.createElement("button");
  copyButton.id = "copy-button";
  copyButton.textContent = "Copy Prompt";
  copyButton.onclick = () => {
    navigator.clipboard.writeText(promptText);
    copyButton.textContent = "Copied!";
    setTimeout(() => (copyButton.textContent = "Copy Prompt"), 1500);
  };

  chatContainer.appendChild(copyButton);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
    });

    const data = await response.json();

    if (data.coaching && data.output) {
      appendMessage("kalama", data.coaching);
      appendOutput(data.output);
      appendCopyButton(message);
  
    } else {
      appendMessage("kalama", "Something went wrong. Please try again.");
    }
  } catch (err) {
    appendMessage("kalama", "Error connecting to the server. Please try again.");
    console.error(err);
  }
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
