export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    /* ---------------- TEXT (ChatGPT) ---------------- */
    if (body.type === "text") {
      if (!env.OPEN_AI_KEY) {
        return json({ error: "OPEN_AI_KEY missing" }, 500);
      }

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
            messages: [
              {
                role: "user",
                content: `Solve this problem. Answer only.\n\n${body.question}`
              }
            ],
            temperature: 0
          })
        });

        const data = await r.json();

        if (!data.choices || !data.choices[0]) {
          return json({ error: "OpenAI response invalid", detail: data }, 500);
        }

        return json({
          final: data.choices[0].message.content.trim()
        });

      } catch (e) {
        return json({ error: "AI server error", detail: String(e) }, 500);
      }
    }

    /* ---------------- IMAGE (Gemini Vision) ---------------- */
    if (body.type === "image") {
      if (!env.GEMINI_API_KEY) {
        return json({ error: "GEMINI_API_KEY missing" }, 500);
      }

      if (!body.imageBase64) {
        return json({ error: "imageBase64 missing" }, 400);
      }

      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-vision:generateContent?key=${env.GEMINI_API_KEY}`,
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
                        mime_type: "image/png",
                        data: body.imageBase64
                      }
                    },
                    {
                      text: "Solve the problem in the image. Answer only."
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await r.json();

        if (!data.candidates || !data.candidates[0]) {
          return json({ error: "Gemini response invalid", detail: data }, 500);
        }

        return json({
          final: data.candidates[0].content.parts[0].text.trim()
        });

      } catch (e) {
        return json({ error: "AI server error", detail: String(e) }, 500);
      }
    }

    return json({ error: "Unknown type" }, 400);
  }
};

/* ---------------- helper ---------------- */
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
