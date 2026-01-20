export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return new Response("Not allowed", { status: 405 });
      }

      const body = await request.json();

      // =========================
      // TEXT MODE (OpenAI)
      // =========================
      if (body.type === "text") {
        if (!body.question) {
          return json({ error: "question missing" }, 400);
        }

        const answer = await callOpenAI(body.question, env.OPEN_AI_KEY);
        return json({ final: answer });
      }

      // =========================
      // IMAGE MODE (Gemini)
      // =========================
      if (body.type === "image") {
        if (!body.imageBase64) {
          return json({ error: "imageBase64 missing" }, 400);
        }

        const base64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const answer = await callGeminiVision(
          base64,
          "image/png",
          env.GEMINI_API_KEY
        );

        return json({ final: answer });
      }

      return json({ error: "invalid type" }, 400);
    } catch (err) {
      return json(
        { error: "AI server error", detail: err.message },
        500
      );
    }
  }
};

// =========================
// OpenAI (TEXT)
// =========================
async function callOpenAI(question, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Solve this math problem. Reply with ONLY the final answer:\n" +
            question
        }
      ],
      temperature: 0
    })
  });

  const data = await res.json();

  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "No answer"
  );
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
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              },
              {
                text:
                  "Read the math problem in the image carefully. Then reply with ONLY the final answer."
              }
            ]
          }
        ]
      })
    }
  );

  const data = await res.json();

  const parts =
    data.candidates?.[0]?.content?.parts || [];

  let text = parts.map(p => p.text || "").join("\n").trim();

  if (!text) return "No answer";

  const match = text.match(/-?\d+(\.\d+)?/);
  return match ? match[0] : text;
}

// =========================
// JSON helper
// =========================
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
