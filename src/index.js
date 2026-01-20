export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    try {
      const body = await req.json();
      const question = body.question?.trim();

      if (!question) {
        return json({ final: "질문 없음" });
      }

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "너는 모든 문제를 정확히 푸는 AI다. 수학, 영어, 독해 전부 풀어라."
            },
            { role: "user", content: question }
          ],
          temperature: 0.2
        })
      });

      const data = await r.json();
      const answer =
        data?.choices?.[0]?.message?.content?.trim() ||
        "답변을 생성하지 못했어요";

      return json({ final: answer });
    } catch (e) {
      return json({ final: "AI server error" }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
