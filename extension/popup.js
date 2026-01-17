document.getElementById("pick").onclick = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const selection = await chrome.tabs.sendMessage(
    tab.id,
    { type: "GET_SELECTION" }
  );

  const res = await fetch(
    "https://YOUR_WORKER_URL", // ✍️ 여기에 Workers URL
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: selection.text
      })
    }
  );

  const data = await res.json();

  document.getElementById("result").textContent =
    `Final: ${data.final}`;
};
