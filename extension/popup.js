document.addEventListener("DOMContentLoaded", () => {
  const workerUrl = "https://pickai.sis00011086.workers.dev/";

  const questionBox = document.getElementById("question");
  const resultBox = document.getElementById("result");
  const pickBtn = document.getElementById("pick");
  const explainBtn = document.getElementById("explain");

  if (!pickBtn || !explainBtn) {
    console.error("Buttons not found");
    return;
  }

  pickBtn.onclick = () => send("pick");
  explainBtn.onclick = () => send("explain");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || tab.url.startsWith("chrome://")) return;

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      },
      (res) => {
        if (res && res[0] && res[0].result) {
          questionBox.value = res[0].result;
        }
      }
    );
  });

  function send(mode) {
    const question = questionBox.value.trim();
    if (!question) {
      resultBox.textContent = "Select a question first.";
      return;
    }

    resultBox.textContent = "Thinking...";

    fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode })
    })
      .then((r) => r.json())
      .then((data) => {
        resultBox.textContent =
          mode === "pick"
            ? `Answer: ${data.final}`
            : data.explanation || data.final;
      })
      .catch((e) => {
        console.error(e);
        resultBox.textContent = "Error";
      });
  }
});
