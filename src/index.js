export default {
  async fetch(request, env) {
    // ❌ GET 접근 차단
    if (request.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const { type } = body;

    try {
      // =========================
      // 🧠 TEXT → OpenAI
      // =========================
      if (type === "text") {
        const question = body.question;
        if (!question) {
          return json({ error: "question missing" }, 400);
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPEN_AI_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Answer the question. Answer only."
              },
              {
                role: "user",
                content: question
              }
            ],
            temperature: 0
          })
        });

        const data = await res.json();

        if (!data.choices?.[0]?.message?.content) {
          throw new Error("OpenAI response invalid");
        }

        return json({
          final: data.choices[0].message.content.trim()
        });
      }

      // =========================
      // 🖼 IMAGE → Gemini
      // =========================
      if (type === "image") {
        const base64 = body.imageBase64;
        if (!base64) {
          return json({ error: "imageBase64 missing" }, 400);
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: "Solve the problem shown in the image. Answer only." },
                    {
                      inlineData: {
                        mimeType: "image/png",
                        data: base64
                      }
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await res.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error("Gemini response invalid");
        }

        return json({
          final: data.candidates[0].content.parts[0].text.trim()
        });
      }

      return json({ error: "Unknown type" }, 400);

    } catch (e) {
      return json({
        error: "AI server error",
        detail: e.message
      }, 500);
    }
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
