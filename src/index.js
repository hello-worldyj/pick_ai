export default {
  async fetch(req, env) {
    try {
      if (req.method !== "POST") {
        return new Response("Not allowed", { status: 405 });
      }

      const body = await req.json();

      /* ================= TEXT (ChatGPT) ================= */
      if (body.type === "text") {
        const question = body.question?.trim();
        if (!question) {
          return json({ final: "질문이 비어 있어요" });
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: "You solve problems and reply with ONLY the final answer."
              },
              {
                role: "user",
                content: question
              }
            ],
            temperature: 0
          })
        });

        const data = await res.json();

        const answer =
          data?.choices?.[0]?.message?.content?.trim();

        return json({
          final: answer || "답변을 생성하지 못했어요"
        });
      }

      /* ================= IMAGE (placeholder) ================= */
      if (body.type === "image") {
        return json({
          final: "이미지 풀이는 아직 연결 중이에요"
        });
      }

      return json({ final: "Unknown request" });
    } catch (e) {
      return json({
        final: "서버 오류",
        detail: String(e)
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
