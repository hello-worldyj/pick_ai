chrome.runtime.onMessage.addListener(
  (req, sender, sendResponse) => {
    if (req.type === "GET_SELECTION") {
      sendResponse({
        text: window.getSelection().toString()
      });
    }
  }
);
