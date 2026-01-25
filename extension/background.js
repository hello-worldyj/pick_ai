// background.js
chrome.runtime.onMessage.addListener((msg, sender) => {
  // msg from content script (PickAI tab)
  if (msg && msg.type === "OCR_TO_BG") {
    // sender.tab.id is the PickAI tab id
    const fromTabId = sender.tab?.id;
    // forward to any chat.openai.com tabs (content.js will postMessage into page)
    chrome.tabs.query({ url: "https://chat.openai.com/*" }, (tabs) => {
      tabs.forEach((t) => {
        chrome.tabs.sendMessage(t.id, {
          type: "FORWARD_OCR",
          text: msg.text,
          fromTabId: fromTabId
        });
      });
    });
  }

  // msg from content script in ChatGPT tab (Tampermonkey posted answer and content.js forwarded to bg)
  if (msg && msg.type === "ANSWER_TO_BG") {
    const toTabId = msg.toTabId;
    const answer = msg.answer;
    if (typeof toTabId === "number") {
      chrome.tabs.sendMessage(toTabId, {
        type: "CHATGPT_ANSWER",
        answer: answer
      });
    }
  }
});

// Command (keyboard) handling: send ASK_MATH to active tab
chrome.commands.onCommand.addListener((command) => {
  if (command === "solve-math") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ASK_MATH" });
      }
    });
  }
});
