// content.js
console.log("[EXT] content.js loaded");

// 1) Listen for window.postMessage from page (PickAI page will post this)
window.addEventListener("message", (e) => {
  if (!e.data) return;
  // from PickAI page: OCR_RESULT -> forward to background
  if (e.data.type === "OCR_RESULT") {
    chrome.runtime.sendMessage({ type: "OCR_TO_BG", text: e.data.text });
    console.log("[EXT] forwarded OCR to background:", e.data.text);
  }

  // Also listen for Tampermonkey->page POST when Tampermonkey posts CHATGPT_ANSWER inside ChatGPT page
  if (e.data.type === "CHATGPT_ANSWER_FROM_TM") {
    // content.js inside ChatGPT page will forward to background
    // expected e.data.toTabId to route back
    chrome.runtime.sendMessage({
      type: "ANSWER_TO_BG",
      answer: e.data.answer,
      toTabId: e.data.toTabId
    });
    console.log("[EXT] received TM answer, forwarded to background:", e.data.answer, e.data.toTabId);
  }
});

// 2) Receive messages from background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;

  // Background forwarded OCR to chat.openai tabs: inject page-level message so Tampermonkey can listen
  if (msg.type === "FORWARD_OCR") {
    window.postMessage({
      type: "OCR_RESULT",
      text: msg.text,
      fromTabId: msg.fromTabId
    }, "*");
    console.log("[EXT] posted OCR_RESULT into page (ChatGPT tab)");
  }

  // Background sent ChatGPT answer to PickAI tab: post into page so PickAI JS can catch
  if (msg.type === "CHATGPT_ANSWER") {
    window.postMessage({
      type: "CHATGPT_ANSWER",
      answer: msg.answer
    }, "*");
    console.log("[EXT] posted CHATGPT_ANSWER into page (PickAI tab)");
  }

  // ASK_MATH from background (keyboard command) => open prompt on this page
  if (msg.type === "ASK_MATH") {
    const problem = prompt("수학 문제 입력:");
    if (problem) {
      // simulate as PickAI sending OCR result
      chrome.runtime.sendMessage({ type: "OCR_TO_BG", text: problem });
    }
  }
});