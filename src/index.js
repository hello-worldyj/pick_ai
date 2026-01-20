export default {
  async fetch(request, env) {
    /* ✅ CORS & preflight */
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    try {
      const body = await request.json();
      const question = body.question?.trim();

      if (!question) {
        return json({ final: "No answer" });
      }

      /* 🔹 OpenAI text only */
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
              content: "Return only the final answer. No explanation."
            },
            { role: "user", content: question }
          ],
          temperature: 0
        })
      });

      const data = await res.json();
      const answer =
        data?.choices?.[0]?.message?.content?.trim() || "No answer";

      return json({ final: answer });
    } catch {
      return json({ final: "No answer" });
    }
  }
};

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
