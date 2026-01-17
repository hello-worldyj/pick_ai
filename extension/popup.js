document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pick").onclick = () => run();
  document.getElementById("explain").onclick = () => run("explain");

  function run(mode = "pick") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab || tab.url.startsWith("chrome://")) {
        alert("couldn't use on this site. We are sorry");
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    });
  }
});
