export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return new Response("OK", { status: 200 });
      }

      const body = await request.json();
      const question = body.question;

      if (!question) {
        return new Response(
          JSON.stringify({ error: "No question provided" }),
          { status: 400 }
        );
      }

      const answers = [];

      for (let i = 0; i < 3; i++) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": Bearer ${env.OPEN_AI_KEY},
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a strict exam solver. Return ONLY the final answer. No explanation."
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
        const answer = data.choices?.[0]?.message?.content?.trim();

        if (answer) answers.push(answer);
      }

      // Pick AI 로직
      const count = {};
      for (const a of answers) {
        count[a] = (count[a] || 0) + 1;
      }

      let final = answers[answers.length - 1];
      for (const key in count) {
        if (count[key] >= 2) final = key;
      }

      return new Response(
        JSON.stringify({
          final,
          tries: answers.length,
          mode: "pick"
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Worker crashed",
          detail: err.message
        }),
        { status: 500 }
      );
    }
  }
};
