chrome.storage.sync.get(["autoOCR", "mode"], (data) => {
  document.getElementById("autoOCR").checked = data.autoOCR ?? true;
  document.getElementById("mode").value = data.mode ?? "pick";
});

document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("change", () => {
    chrome.storage.sync.set({
      autoOCR: document.getElementById("autoOCR").checked,
      mode: document.getElementById("mode").value
    });
  });
});
