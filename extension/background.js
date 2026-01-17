chrome.commands.onCommand.addListener((command) => {
  if (command !== "run-pick-ai") return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || tab.url.startsWith("chrome://")) return;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const sel = window.getSelection().toString();
        alert(sel ? `Selected:\n${sel}` : "No selection found");
      }
    });
  });
});
