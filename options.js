document.getElementById("test").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // run in page context
      window.postMessage({ type: "OCR_RESULT", text: "2+3" }, "*");
    }
  });
});