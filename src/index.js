export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad JSON", { status: 400 });
    }

    const { type, question, imageBase64 } = body;

    try {
      // ===============================
      // 📝 TEXT → ChatGPT (OpenAI)
      // ===============================
      if (type === "text") {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: "Return ONLY the final answer. No explanation."
              },
              {
                role: "user",
                content: question
              }
            ],
            temperature: 0
          })
        });

        if (!r.ok) {
          const t = await r.text();
          console.log("OPENAI ERROR:", r.status, t);
          return new Response(JSON.stringify({ error: "AI server error" }), { status: 500 });
        }

        const data = await r.json();
        const answer = data.choices?.[0]?.message?.content?.trim() || "Unknown";

        return new Response(
          JSON.stringify({ final: answer }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // ===============================
      // 🖼️ IMAGE → Gemini
      // ===============================
      if (type === "image") {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: "Return ONLY the final answer." },
                    {
                      inlineData: {
                        mimeType: "image/png",
                        data: imageBase64
                      }
                    }
                  ]
                }
              ]
            })
          }
        );

        if (!r.ok) {
          const t = await r.text();
          console.log("GEMINI ERROR:", r.status, t);
          return new Response(JSON.stringify({ error: "AI server error" }), { status: 500 });
        }

        const data = await r.json();
        const answer =
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Unknown";

        return new Response(
          JSON.stringify({ final: answer }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response("Invalid type", { status: 400 });

    } catch (e) {
      console.log("SERVER ERROR:", e);
      return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
  }
};
