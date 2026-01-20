export default {
  async fetch(req, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Not allowed", {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const { question } = await req.json();

      if (!question) {
        return new Response(
          JSON.stringify({ final: "No question" }),
          { headers: corsHeaders }
        );
      }

      const aiRes = await fetch(
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
              { role: "system", content: "Solve and output only final answer." },
              { role: "user", content: question }
            ],
            temperature: 0
          })
        }
      );

      const data = await aiRes.json();
      const answer = data.choices?.[0]?.message?.content?.trim();

      return new Response(
        JSON.stringify({ final: answer || "Unable to solve" }),
        { headers: corsHeaders }
      );

    } catch (e) {
      return new Response(
        JSON.stringify({ final: "AI server error" }),
        { headers: corsHeaders }
      );
    }
  }
};
