export default {
  async fetch(req, env) {

    // ========================
    // CORS PRE-FLIGHT
    // ========================
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: cors()
      });
    }

    if (req.method !== "POST") {
      return json({ error: "Not allowed" }, 405);
    }

    try {
      const body = await req.json();
      const question = (body.question || "").trim();

      if (!question) {
        return json({ final: "문제를 인식하지 못했어요" });
      }

      // ========================
      // OPENAI REQUEST
      // ========================
      const r = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o",
            temperature: 0,
            max_tokens: 700,
            messages: [
              {
                role: "system",
                content:
                  "너는 시험 문제를 푸는 AI다. 문제가 불완전해도 반드시 추론해서 답을 만들어라. 절대 빈 응답을 하지 마라."
              },
              {
                role: "user",
                content:
                  "다음 문제를 풀어라. 설명 없이 정답만 출력하라.\n\n" +
                  question
              }
            ]
          })
        }
      );

      const data = await r.json();

      let answer =
        data?.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        answer = "문제를 해석할 수 없지만 가장 가능성 높은 답을 선택함";
      }

      return json({ final: answer });

    } catch (e) {
      return json({ final: "AI server error" }, 500);
    }
  }
};

// ========================
// HELPERS
// ========================
function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...cors()
    }
  });
}
