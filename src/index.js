export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    try {
      const { question } = await req.json();
      if (!question) {
        return Response.json({ final: "No question" });
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
              content: "Solve the problem and output only the final answer."
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

      return Response.json({
        final: answer || "Unable to solve"
      });

    } catch (e) {
      return Response.json({ final: "AI server error" });
    }
  }
};
