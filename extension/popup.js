document.getElementById("solveBtn").onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { type: "ASK_MATH" });
    });
};
