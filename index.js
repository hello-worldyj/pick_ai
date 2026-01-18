export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }

    const question = (body.question || "").trim();
    if (!question) {
      return Response.json({ ok: false });
    }

    try {
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
                "You are a solver. Return ONLY the final answer. No explanation. No extra words."
            },
            {
              role: "user",
              content: question
            }
          ],
          temperature: 0
        })
      });

      if (!aiRes.ok) {
        return Response.json({ ok: false });
      }

      const data = await aiRes.json();
      const final =
        data?.choices?.[0]?.message?.content?.trim();

      if (!final) {
        return Response.json({ ok: false });
      }

      return Response.json({
        ok: true,
        final
      });

    } catch (e) {
      return Response.json({ ok: false });
    }
  }
};
