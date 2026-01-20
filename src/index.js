export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    try {
      const contentType = request.headers.get("content-type") || "";

      // 🖼 이미지 업로드
      if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        const file = form.get("image");

        if (!file) {
          return json({ error: "image missing" }, 400);
        }

        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(buffer))
        );

        const answer = await callGeminiVision(base64, env.GEMINI_API_KEY);
        return json({ final: answer });
      }

      // 📝 텍스트
      const body = await request.json();
      if (body.type === "text") {
        const answer = await callOpenAI(body.question, env.OPEN_AI_KEY);
        return json({ final: answer });
      }

      return json({ error: "invalid request" }, 400);
    } catch (e) {
      return json({ error: "AI server error", detail: String(e) }, 500);
    }
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function callGeminiVision(base64, apiKey) {
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
                  mime_type: "image/png",
                  data: base64
                }
              },
              { text: "Solve the problem and give only the final answer." }
            ]
          }
        ]
      })
    }
  );

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer";
}

async function callOpenAI(text, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
      temperature: 0
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No answer";
}
