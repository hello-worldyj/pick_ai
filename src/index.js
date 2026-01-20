export default {
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    const { question } = await req.json();

    if (!question) {
      return Response.json({ final: "No question" });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPEN_AI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: question }]
      })
    });

    const j = await r.json();

    return Response.json({
      final: j.choices?.[0]?.message?.content ?? "Unable to solve"
    });
  }
};
