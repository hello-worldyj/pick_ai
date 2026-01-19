export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (body.type === "text") {
      return handleText(body, env);
    }

    if (body.type === "image") {
      return handleImage(body, env);
    }

    return json({ error: "Unknown type" }, 400);
  }
};

/* ---------------- TEXT (ChatGPT) ---------------- */

async function handleText(body, env) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY missing" }, 500);
  }

  const question = body.question;
  if (!question) {
    return json({ error: "No question" }, 400);
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Answer briefly. Only the final answer." },
          { role: "user", content: question }
        ]
      })
    });

    const j = await r.json();
    const answer = j.choices?.[0]?.message?.content;

    if (!answer) throw new Error("No answer");

    return json({ final: answer.trim() });

  } catch (e) {
    return json({ error: "AI server error" }, 500);
  }
}

/* ---------------- IMAGE (Gemini) ---------------- */

async function handleImage(body, env) {
  if (!env.GEMINI_API_KEY) {
    return json({ error: "GEMINI_API_KEY missing" }, 500);
  }

  const img = body.imageBase64;
  if (!img) {
    return json({ error: "No imageBase64" }, 400);
  }

  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: img
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

    const j = await r.json();
    const answer =
      j.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) throw new Error("No answer");

    return json({ final: answer.trim() });

  } catch (e) {
    return json({ error: "AI server error" }, 500);
  }
}

/* ---------------- UTIL ---------------- */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
