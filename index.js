export default {
  async fetch(req, env) {

    // ✅ CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: cors()
      });
    }

    if (req.method !== "POST") {
      return json({ error: "Not allowed" }, 405);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const question = body.question;
    if (!question) {
      return json({ error: "No question" }, 400);
    }

    // 🔥 OpenAI 호출
    try {
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: "Give only the final answer. No explanation."
            },
            {
              role: "user",
              content: question
            }
          ],
          temperature: 0
        })
      });

      const aiData = await aiRes.json();

      const answer =
        aiData?.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        return json({ error: "AI failed" }, 500);
      }

      return json({ final: answer });

    } catch (e) {
      return json({ error: "AI server error" }, 500);
    }
  }
};

function cors() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: cors()
  });
}
