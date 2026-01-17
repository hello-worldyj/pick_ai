let popup = null;
let lastText = "";

document.addEventListener("selectionchange", () => {
  const text = window.getSelection()?.toString().trim();
  if (text) lastText = text;
});

document.addEventListener("mouseup", (e) => {
  if (!lastText) return;

  removePopup();

  popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = `${e.clientY + 8}px`;
  popup.style.left = `${e.clientX + 8}px`;
  popup.style.zIndex = 999999;
  popup.style.background = "#111";
  popup.style.color = "#fff";
  popup.style.padding = "6px 8px";
  popup.style.borderRadius = "6px";
  popup.style.fontSize = "12px";
  popup.style.boxShadow = "0 4px 12px rgba(0,0,0,.3)";
  popup.style.cursor = "pointer";

  popup.textContent = "Pick AI";

  popup.onclick = () => askAI(lastText);

  document.body.appendChild(popup);
});

function askAI(question) {
  popup.textContent = "Thinking...";

  fetch("https://pickai.sis00011086.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, mode: "pick" })
  })
    .then(r => r.json())
    .then(data => {
      popup.textContent = `✔ ${data.final}`;
    })
    .catch(() => {
      popup.textContent = "Error";
    });
}

function removePopup() {
  if (popup) popup.remove();
  popup = null;
}

document.addEventListener("mousedown", removePopup);
