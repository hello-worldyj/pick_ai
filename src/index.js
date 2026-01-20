export default {
  async fetch(req, env) {
    try {
      if (req.method !== "POST") {
        return new Response("Not allowed", { status: 405 });
      }

      const body = await req.json();
      const question = body.question?.trim();

      if (!question) {
        return Response.json({ error: "No question provided" }, { status: 400 });
      }

      const openaiRes = await fetch(
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
                content: "Solve the problem and give only the final answer."
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

      const data = await openaiRes.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        return Response.json({
          error: "OpenAI returned no answer",
          raw: data
        });
      }

      return Response.json({
        final: data.choices[0].message.content.trim()
      });

    } catch (err) {
      return Response.json({
        error: "Server exception",
        detail: err.toString()
      }, { status: 500 });
    }
  }
};
