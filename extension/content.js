(() => {
  const text =
    window.getSelection().toString() ||
    document.body.innerText.slice(0, 3000);

  fetch("https://pickai.sis00011086.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: text,
      mode: "pick"
    })
  })
    .then((r) => r.json())
    .then((data) => {
      alert("정답: " + data.final);
    })
    .catch(() => {
      alert("Error solving question");
    });
})();
