export default {
  async fetch(req, env) {
    // ---------- CORS ----------
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    try {
      const body = await req.json();
      const question = body.question?.trim();

      if (!question || question.length < 3) {
        return json({ error: "INVALID_QUESTION" }, 400);
      }

      // ---------- OpenAI Responses API ----------
      const aiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: `다음 문제를 정확히 풀고 최종 답만 출력해:\n${question}`
        })
      });

      if (!aiRes.ok) {
        const t = await aiRes.text();
        throw new Error(t);
      }

      const data = await aiRes.json();

      const answer =
        data.output?.[0]?.content?.[0]?.text ||
        data.output_text;

      if (!answer) {
        throw new Error("NO_AI_OUTPUT");
      }

      return json({ final: answer });

    } catch (e) {
      return json({
        error: "AI_FAILED",
        detail: e.message
      }, 500);
    }
  }
};

// ---------- helper ----------
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
