export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return new Response("Not allowed", { status: 405 });
      }

      const body = await request.json();

      // ======================
      // TEXT → OpenAI
      // ======================
      if (body.type === "text") {
        if (!env.OPEN_AI_KEY) {
          return json({ error: "OPEN_AI_KEY missing" }, 500);
        }

        if (!body.question) {
          return json({ error: "question missing" }, 400);
        }

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
                role: "system",
                content: "Answer with final answer only. No explanation."
              },
              {
                role: "user",
                content: body.question
              }
            ]
          })
        });

        const data = await r.json();

        if (!data.choices) {
          return json({ error: "OpenAI response invalid", detail: data }, 500);
        }

        return json({
          final: data.choices[0].message.content.trim()
        });
      }

      // ======================
      // IMAGE → Gemini
      // ======================
      if (body.type === "image") {
        if (!env.GEMINI_API_KEY) {
          return json({ error: "GEMINI_API_KEY missing" }, 500);
        }

        if (!body.imageBase64) {
          return json({ error: "imageBase64 missing" }, 400);
        }

        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
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

        if (!data.candidates) {
          return json({ error: "Gemini response invalid", detail: data }, 500);
        }

        return json({
          final: data.candidates[0].content.parts[0].text.trim()
        });
      }

      return json({ error: "unknown type" }, 400);
    } catch (e) {
      return json({ error: "server crash", detail: String(e) }, 500);
    }
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
