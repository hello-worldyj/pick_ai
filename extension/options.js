document.addEventListener("DOMContentLoaded", () => {
  const autoSolve = document.getElementById("autoSolve");
  const autoCopy = document.getElementById("autoCopy");
  const mode = document.getElementById("mode");
  const saveBtn = document.getElementById("save");

  chrome.storage.sync.get(
    ["autoSolve", "autoCopy", "mode"],
    (data) => {
      autoSolve.checked = data.autoSolve ?? true;
      autoCopy.checked = data.autoCopy ?? false;
      mode.value = data.mode ?? "pick";
    }
  );

  saveBtn.onclick = () => {
    chrome.storage.sync.set({
      autoSolve: autoSolve.checked,
      autoCopy: autoCopy.checked,
      mode: mode.value
    });

    saveBtn.textContent = "Saved ✓";
    setTimeout(() => (saveBtn.textContent = "Save Settings"), 1200);
  };
});
