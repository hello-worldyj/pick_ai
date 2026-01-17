export default {
  async fetch(request, env) {
    // ✅ CORS + Preflight (3번)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("OK", {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    try {
      const body = await request.json();
      const question = body.question;

      if (!question) {
        return new Response(
          JSON.stringify({ error: "No question provided" }),
          {
            status: 400,
            headers: { "Access-Control-Allow-Origin": "*" }
          }
        );
      }

      const answers = [];

      for (let i = 0; i < 3; i++) {
        const res = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
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
                    "Return ONLY the final answer. No explanation."
                },
                {
                  role: "user",
                  content: question
                }
              ],
              temperature: 0
            })
          }
        );

        // ✅ OpenAI 응답 안전 처리 (2번)
        if (!res.ok) {
          const errText = await res.text();
          return new Response(
            JSON.stringify({
              error: "OpenAI request failed",
              status: res.status,
              detail: errText
            }),
            {
              status: 500,
              headers: { "Access-Control-Allow-Origin": "*" }
            }
          );
        }

        const data = await res.json();
        const answer =
          data?.choices?.[0]?.message?.content?.trim();

        if (answer) answers.push(answer);
      }

      // Pick AI 로직
      const count = {};
      for (const a of answers) {
        count[a] = (count[a] || 0) + 1;
      }

      let final = answers[answers.length - 1];
      for (const k in count) {
        if (count[k] >= 2) final = k;
      }

      return new Response(
        JSON.stringify({
          final,
          tries: answers.length,
          mode: "pick"
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Worker crashed",
          message: e.message
        }),
        {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        }
      );
    }
  }
};
