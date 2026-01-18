export default {
  async fetch(request, env) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // POST만 허용
    if (request.method !== "POST") {
      return json({
        ok: false,
        error: "Not allowed"
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({
        ok: false,
        error: "Invalid JSON"
      });
    }

    const question = body.question?.trim();

    // 질문 없으면 바로 에러 (No answer 절대 안 나옴)
    if (!question) {
      return json({
        ok: false,
        error: "Empty question"
      });
    }

    // OpenAI 키 체크
    if (!env.OPEN_AI_KEY) {
      return json({
        ok: false,
        error: "Missing OpenAI key"
      });
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
              content:
                "You solve questions. Reply ONLY with the final answer. No explanation."
            },
            {
              role: "user",
              content: question
            }
          ],
          temperature: 0
        })
      });

      if (!res.ok) {
        const t = await res.text();
        return json({
          ok: false,
          error: "OpenAI error",
          detail: t
        });
      }

      const data = await res.json();
      const answer =
        data.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        return json({
          ok: false,
          error: "AI returned empty answer"
        });
      }

      return json({
        ok: true,
        final: answer
      });
    } catch (err) {
      return json({
        ok: false,
        error: "Server error",
        detail: String(err)
      });
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
