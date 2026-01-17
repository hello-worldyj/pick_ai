<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pick AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      width: 260px;
      padding: 12px;
    }
    button {
      width: 100%;
      margin-top: 6px;
      padding: 8px;
      font-size: 14px;
      cursor: pointer;
    }
    textarea {
      width: 100%;
      height: 60px;
      margin-top: 6px;
      resize: none;
    }
    #result {
      margin-top: 8px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h3>Pick AI</h3>

  <!-- 👇 id 중요 -->
  <button id="pick">Answer only</button>
  <button id="explain">Explain</button>

  <textarea id="question" placeholder="Selected question will appear here"></textarea>

  <div id="result"></div>

  <script src="popup.js"></script>
</body>
</html>
