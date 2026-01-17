(async () => {
  let text = window.getSelection()?.toString().trim();

  if (!text || text.length < 3) {
    text = document.body.innerText.slice(0, 3000);
  }

  if (!text || text.length < 5) {
    alert("=couldn't find an answer");
    return;
  }

  try {
    const res = await fetch("https://pickai.sis00011086.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text, mode: "pick" })
    });

    const data = await res.json();

    const answer =
      typeof data === "object" && data.final
        ? data.final
        : "failed to generate answer";

    alert("answer: " + answer);
  } catch {
    alert("ai server error");
  }
})();
