export default {
  async fetch(request, env) {
    // 🔥 CORS 헤더
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const body = await request.json();

      // ---------- TEXT ----------
      if (body.type === "text") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Solve and return ONLY the final answer." },
              { role: "user", content: body.question }
            ],
          }),
        });

        const data = await res.json();
        const answer = data.choices?.[0]?.message?.content ?? "No answer";

        return new Response(
          JSON.stringify({ final: answer }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ---------- IMAGE ----------
      if (body.type === "image") {
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
            env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Solve the problem in this image. Return ONLY the final answer." },
                  {
                    inline_data: {
                      mime_type: "image/png",
                      data: body.imageBase64
                    }
                  }
                ]
              }]
            }),
          }
        );

        const data = await res.json();
        const answer =
          data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No answer";

        return new Response(
          JSON.stringify({ final: answer }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: corsHeaders }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error", detail: String(err) }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
