// ===== OCR → Tampermonkey =====
function sendOCRResult(text) {
  window.postMessage(
    {
      source: "PICK_AI",
      type: "OCR_RESULT",
      text
    },
    "*"
  );
}

// ===== 테스트 =====
window.testOCR = () => {
  sendOCRResult("2+3");
};

// ===== ChatGPT 답 받기 =====
window.addEventListener("message", (e) => {
  if (!e.data || e.data.source !== "CHATGPT") return;
  if (e.data.type !== "ANSWER") return;

  console.log("✅ 정답:", e.data.text);

  // 👉 여기서 화면에 뿅 띄우면 끝
});
