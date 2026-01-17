(async () => {
  let text = window.getSelection().toString().trim();

  // Google Docs / 선택 안 될 때 fallback
  if (!text || text.length < 3) {
    text = Array.from(document.querySelectorAll("iframe"))
      .map(f => {
        try {
          return f.contentDocument?.body?.innerText || "";
        } catch {
          return "";
        }
      })
      .join("\n");
  }

  // 최종 fallback
  if (!text || text.length < 5) {
    text = prompt("문제를 붙여넣으세요:");
    if (!text) return;
  }

  try {
    const res = await fetch("https://pickai.sis00011086.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text.slice(0, 4000),
        mode: "pick"
      })
    });

    const data = await res.json();

    const answer =
      data.final ||
      data.explanation ||
      "답을 찾지 못했습니다";

    alert("정답: " + answer);
  } catch (e) {
    alert("에러 발생");
  }
})();
