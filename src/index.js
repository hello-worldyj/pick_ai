export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    try {
      const contentType = request.headers.get("content-type") || "";

      // =========================
      // 🖼 IMAGE (multipart/form-data)
      // =========================
      if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        const file = form.get("image");

        if (!file) {
          return json({ error: "image missing" }, 400);
        }

        const buffer = await file.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);

        const answer = await callGeminiVision(
          base64,
          file.type || "image/png",
          env.GEMINI_API_KEY
        );

        return json({ final: answer });
      }

      // =========================
      // 📝 TEXT (JSON)
      // =========================
      const body = await request.json();

      if (body.type === "text" && body.question) {
        const answer = await callOpenAI(
          body.question,
          env.OPEN_AI_KEY
        );
        return json({ final: answer });
      }

      return json({ error: "invalid request" }, 400);

    } catch (e) {
      return json(
        { error: "AI server error", detail: String(e) },
        500
      );
    }
  }
};

// =========================
// helpers
// =========================

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

/**
 * ✅ SAFE base64 (stack overflow 방지)
 */
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
}

// =========================
// Gemini Vision (IMAGE)
// =========================
async function callGeminiVision(base64, mimeType, apiKey) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              },
              {
                text:
                  "Solve the problem shown in the image. Reply with ONLY the final answer. No explanation."
              }
            ]
          }
        ]
      })
    }
  );

  const data = await res.json();

  const parts = data.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "No answer";

  for (const p of parts) {
    if (typeof p.text === "string" && p.text.trim()) {
      return p.text.trim();
    }
  }

  return "No answer";
}

// =========================
// OpenAI (TEXT)
// =========================
async function callOpenAI(text, apiKey) {
  const res = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content:
              "Solve this and reply with ONLY the final answer:\n" +
              text
          }
        ],
        temperature: 0
      })
    }
  );

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "No answer"
  );
}
