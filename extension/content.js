let popup;

document.addEventListener("dblclick", (e) => {
  const text = window.getSelection().toString().trim();
  if (!text) return;

  removePopup();

  popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = e.clientY + "px";
  popup.style.left = e.clientX + "px";
  popup.style.zIndex = 999999;
  popup.style.background = "#111";
  popup.style.color = "#fff";
  popup.style.padding = "8px";
  popup.style.borderRadius = "8px";
  popup.style.fontSize = "12px";
  popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

  popup.innerHTML = `
    <div style="margin-bottom:6px;">Pick AI</div>
    <button id="pick-ai-btn" style="width:100%;cursor:pointer;">anser only</button>
  `;

  document.body.appendChild(popup);

  document.getElementById("pick-ai-btn").onclick = () => {
    askAI(text);
  };
});

function askAI(question) {
  popup.innerHTML = "thinking...";

  fetch("https://pickai.sis00011086.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, mode: "pick" })
  })
    .then((r) => r.json())
    .then((data) => {
      popup.innerHTML = `<strong>answer:</strong> ${data.final}`;
    })
    .catch(() => {
      popup.innerHTML = "error";
    });
}

function removePopup() {
  if (popup) popup.remove();
  popup = null;
}

// 다른 곳 클릭하면 닫힘
document.addEventListener("click", () => {
  removePopup();
});
