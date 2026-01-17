document.addEventListener("DOMContentLoaded", () => {
  const workerUrl = "https://pickai.sis00011086.workers.dev/";

  const questionBox = document.getElementById("question");
  const resultBox = document.getElementById("result");
  const pickBtn = document.getElementById("pick");
  const explainBtn = document.getElementById("explain");

  pickBtn.onclick = () => send("pick");
  explainBtn.onclick = () => send("explain");

  // 선택한 텍스트 가져오기
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => window.getSelection().toString()
      },
      (res) => {
        if (res && res[0]) {
          questionBox.value = res[0].result || "";
        }
      }
    );
  });

  function send(mode) {
    const question = questionBox.value.trim();
    if (!question) {
      resultBox.textContent = "select the question.";
      return;
    }

    resultBox.textContent = "thinking...";

    fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode })
    })
      .then((r) => r.json())
      .then((data) => {
        resultBox.textContent =
          mode === "pick"
            ? `answer: ${data.final}`
            : data.explanation || data.final;
      })
      .catch(() => {
        resultBox.textContent = "error try again";
      });
  }
});
