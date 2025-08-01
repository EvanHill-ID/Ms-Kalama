const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatContainer = document.getElementById("chat-container");
const nextButton = document.getElementById("next-btn");

function addMessage(content, className = "bot-message") {
  const msg = document.createElement("div");
  msg.className = className;
  msg.innerHTML = content;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addCopyButton(promptText) {
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy Prompt";
  copyBtn.className = "copy-btn";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(promptText);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Prompt"), 1500);
  };
  chatContainer.appendChild(copyBtn);
}

sendButton.addEventListener("click", async () => {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  addMessage(prompt, "user-message");
  userInput.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });

    const { coaching, output, complete } = await response.json();

    addMessage(`<strong>Ms. Kalama:</strong> ${coaching}`);
    addMessage(`<strong>Sample AI Output:</strong><br><em>${output}</em>`);

    if (coaching.includes("This is a strong prompt")) {
      addCopyButton(prompt);
      document.getElementById("next-btn").style.display = "block";
    }
  } catch (err) {
    console.error("Chat error:", err);
    addMessage("Something went wrong. Please try again.");
  }
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendButton.click();
});
