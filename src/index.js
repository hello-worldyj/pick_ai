export default {
  async fetch(request, env) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Not allowed" }), {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const body = await request.json();
      const question = body.question;

      if (!question) {
        return new Response(
          JSON.stringify({ ok: false, error: "No question" }),
          { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Solve the problem and answer concisely." },
            { role: "user", content: question },
          ],
          temperature: 0,
        }),
      });

      const data = await aiRes.json();

      const final =
        data?.choices?.[0]?.message?.content ?? "No answer";

      return new Response(
        JSON.stringify({ ok: true, final }),
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: err.message }),
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
  },
};
