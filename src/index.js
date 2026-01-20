export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    try {
      const body = await request.json();
      const question = body.question?.trim();

      if (!question) {
        return new Response(JSON.stringify({
          final: "질문이 비어 있음"
        }), { headers: cors });
      }

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
              content: "Return ONLY the final answer. No explanation."
            },
            { role: "user", content: question }
          ]
        })
      });

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content?.trim();

      return new Response(JSON.stringify({
        final: answer || "답변을 생성하지 못했어요"
      }), {
        headers: {
          ...cors,
          "Content-Type": "application/json"
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({
        final: "서버 오류"
      }), { headers: cors });
    }
  }
};
