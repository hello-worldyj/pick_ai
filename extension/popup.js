document.getElementById("solve").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    },
    async (res) => {
      const text = res[0].result;
      if (!text) {
        document.getElementById("result").innerText = "선택된 문제가 없음";
        return;
      }

      const r = await fetch("https://pickai.sis00011086.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });

      const data = await r.json();
      document.getElementById("result").innerText = data.final || "에러";
    }
  );
};
