export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return response("Not allowed", 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    // =========================
    // TEXT → OpenAI
    // =========================
    if (body.type === "text") {
      if (!body.question) {
        return json({ error: "question missing" }, 400);
      }

      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
              {
                role: "system",
                content: "Answer ONLY the final answer. No explanation."
              },
              {
                role: "user",
                content: body.question
              }
            ]
          })
        });

        const j = await r.json();
        const answer = j.choices?.[0]?.message?.content?.trim();

        return json({ final: answer || "No answer" });
      } catch (e) {
        return json({ error: "AI server error", detail: String(e) }, 500);
      }
    }

    // =========================
    // IMAGE → Gemini Vision
    // =========================
    if (body.type === "image") {
      if (!body.imageBase64) {
        return json({ error: "imageBase64 missing" }, 400);
      }

      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        // 🔥 핵심: mimeType 강제 jpeg
                        mimeType: "image/jpeg",
                        data: body.imageBase64
                      }
                    },
                    {
                      text: "Solve the problem in this image and return ONLY the final answer."
                    }
                  ]
                }
              ]
            })
          }
        );

        const j = await r.json();

        const parts = j.candidates?.[0]?.content?.parts || [];
        const text = parts
          .map(p => p.text)
          .filter(Boolean)
          .join("\n")
          .trim();

        return json({ final: text || "No answer" });
      } catch (e) {
        return json({ error: "AI server error", detail: String(e) }, 500);
      }
    }

    return json({ error: "Unknown type" }, 400);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function response(text, status = 200) {
  return new Response(text, { status });
}
