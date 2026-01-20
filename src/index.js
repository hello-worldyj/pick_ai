export default {
  async fetch(req, env) {
    try {
      if (req.method !== "POST") {
        return new Response("Not allowed", { status: 405 });
      }

      const body = await req.json();

      /* ---------- TEXT ---------- */
      if (body.type === "text") {
        const question = body.question?.trim();
        if (!question) {
          return json({ final: "질문이 비어 있어요" });
        }

        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
            env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: "문제를 풀고 정답만 간단히 써:\n" + question }]
                }
              ]
            })
          }
        );

        const data = await res.json();

        const answer =
          data?.candidates?.[0]?.content?.parts
            ?.map(p => p.text)
            ?.join("")
            ?.trim();

        return json({
          final: answer || "답변을 생성하지 못했어요"
        });
      }

      /* ---------- IMAGE (placeholder) ---------- */
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
