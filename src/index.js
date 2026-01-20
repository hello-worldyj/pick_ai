export default {
  async fetch(request, env) {
    // ===== CORS =====
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    try {
      const body = await request.json();
      const question =
        body.question ||
        body.text ||
        body.prompt ||
        "";

      if (!question.trim()) {
        return json({ final: "문제가 비어 있음" });
      }

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
          env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: question }],
              },
            ],
          }),
        }
      );

      const data = await res.json();

      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      return json({
        final: answer || "답변을 생성하지 못했어요",
      });
    } catch (e) {
      return json({
        error: "AI server error",
        detail: String(e),
      });
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
