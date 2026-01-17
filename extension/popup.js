document.addEventListener("DOMContentLoaded", () => {
  const workerUrl = "https://pickai.sis00011086.workers.dev/";

  const questionBox = document.getElementById("question");
  const resultBox = document.getElementById("result");
  const pickBtn = document.getElementById("pick");
  const explainBtn = document.getElementById("explain");

  pickBtn.onclick = () => send("pick");
  explainBtn.onclick = () => send("explain");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || tab.url.startsWith("chrome://")) {
      questionBox.value = "";
      resultBox.textContent = "이 페이지에서는 사용 불가";
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      },
      (res) => {
        if (!res || !res[0] || !res[0].result) return;
        questionBox.value = res[0].result;
      }
    );
  });

  function send(mode) {
    const question = questionBox.value.trim();
    if (!question) {
      resultBox.textContent = "문제를 선택하세요.";
      return;
    }

    resultBox.textContent = "생각 중...";

    fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode })
    })
      .then((r) => r.json())
      .then((data) => {
        resultBox.textContent =
          mode === "pick"
            ? `정답: ${data.final}`
            : data.explanation || data.final;
      })
      .catch(() => {
        resultBox.textContent = "에러 발생";
      });
  }
});
