export default {
  async fetch(request, env) {
    // ===============================
    // CORS Preflight 처리
    // ===============================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Not allowed", {
        status: 405,
        headers: cors()
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" });
    }

    // ===============================
    // TEXT MODE (ChatGPT)
    // ===============================
    if (body.type === "text") {
      if (!body.question) {
        return json({ error: "question missing" });
      }

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: "Solve the question. Reply with only the final answer."
              },
              {
                role: "user",
                content: body.question
              }
            ],
            temperature: 0
          })
        });

        const data = await res.json();
        const answer =
          data?.choices?.[0]?.message?.content?.trim() || "No answer";

        return json({ final: answer });
      } catch (e) {
        return json({ error: "AI server error", detail: String(e) });
      }
    }

    // ===============================
    // IMAGE MODE (Gemini Vision)
    // ===============================
    if (body.type === "image") {
      if (!body.imageBase64) {
        return json({ error: "imageBase64 missing" });
      }

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: "image/png",
                        data: body.imageBase64
                      }
                    },
                    {
                      text: "Solve the problem shown in the image. Reply with only the final answer."
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await res.json();
        const answer =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "No answer";

        return json({ final: answer });
      } catch (e) {
        return json({ error: "AI server error", detail: String(e) });
      }
    }

    return json({ error: "Unknown request type" });
  }
};

// ===============================
// Helper functions
// ===============================
function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Content-Type": "application/json",
      ...cors()
    }
  });
}
