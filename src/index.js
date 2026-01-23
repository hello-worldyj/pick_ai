export default {
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const { text, imageBase64 } = body;

    // 1️⃣ OCR 처리 (이미지 있을 때)
    let finalText = text || "";

    if (!finalText && imageBase64) {
      const ocrRes = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          apikey: OCR_API_KEY,
        },
        body: createOCRForm(imageBase64),
      });

      const ocrJson = await ocrRes.json();

      if (ocrJson.IsErroredOnProcessing) {
        return json({
          error: "OCR failed",
          detail: ocrJson.ErrorMessage,
        }, 500);
      }

      finalText = ocrJson.ParsedResults?.[0]?.ParsedText?.trim();
    }

    if (!finalText) {
      return json({ error: "No text to solve" }, 400);
    }

    // 2️⃣ ChatGPT 호출
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPEN_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a solver. Solve clearly and directly.",
          },
          {
            role: "user",
            content: finalText,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      return json({ error: "AI error", detail: err }, 500);
    }

    const aiJson = await aiRes.json();

    return json({
      result: aiJson.choices[0].message.content,
    });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createOCRForm(base64) {
  const boundary = "----OCRBOUNDARY";
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="base64Image"\r\n\r\n` +
    `data:image/png;base64,${base64}\r\n` +
    `--${boundary}--`;

  return new Blob([body], {
    type: `multipart/form-data; boundary=${boundary}`,
  });
}
