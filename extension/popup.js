document.addEventListener("DOMContentLoaded", () => {
  const workerUrl = "https://pickai.sis00011086.workers.dev/";

  const questionBox = document.getElementById("question");
  const resultBox = document.getElementById("result");

  document.getElementById("pick").onclick = () => send("pick");
  document.getElementById("explain").onclick = () => send("explain");

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
      resultBox.textContent = "No question selected.";
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
          mode === "pick" ? `Answer: ${data.final}` : data.explanation;
      })
      .catch(() => {
        resultBox.textContent = "Error";
      });
  }
});
