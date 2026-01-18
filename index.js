export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not allowed" }), { status: 403 });
    }

    const { question } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ final: "No question" }));
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
          { role: "system", content: "Return ONLY the final answer." },
          { role: "user", content: question }
        ],
        temperature: 0
      })
    });

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "Failed";

    return new Response(JSON.stringify({ final: answer }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
