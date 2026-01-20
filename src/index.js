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
        return json({ final: "질문이 비어있음" });
      }

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 500,
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "너는 시험 문제 풀이 AI다. 문제가 불완전해도 추론해서 반드시 답을 만들어라. 모르면 추정 답이라도 써라. 절대 답변을 비우지 마라."
            },
            {
              role: "user",
              content:
                "다음 문제를 풀어라. 설명 없이 정답만 써라.\n\n" +
                question
            }
          ]
        })
      });

      const data = await r.json();

      let answer =
        data?.choices?.[0]?.message?.content?.trim();

      if (!answer || answer.length < 1) {
        answer = "해당 문제를 추론하여 풀 수 없음 (문제 형식 깨짐)";
      }

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
