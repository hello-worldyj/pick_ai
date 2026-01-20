export default {
  async fetch(request, env) {
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
      const question = body.question;

      if (!question) {
        return json({ error: "question missing" }, 400);
      }

      const openaiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [
            {
              role: "system",
              content: "You are a world-class math tutor. Always solve the problem and output ONLY the final answer."
            },
            {
              role: "user",
              content: question
            }
          ],
          max_output_tokens: 200
        })
      });

      const data = await openaiRes.json();

      const text =
        data.output_text ||
        data.output?.[0]?.content?.[0]?.text ||
        null;

      if (!text) {
        return json({ final: "답변을 생성하지 못했어요" });
      }

      return json({ final: text.trim() });
    } catch (e) {
      return json({ error: "AI server error", detail: String(e) }, 500);
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
