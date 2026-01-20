export default {
  async fetch(req, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Not allowed" }),
        { status: 405, headers }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers }
      );
    }

    const question = body.question;
    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({
          error: "invalid_input",
          reason: "question field missing or not string"
        }),
        { status: 400, headers }
      );
    }

    let aiRes;
    try {
      aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You are a precise problem solver. Solve the problem. Return ONLY the final answer. No explanation."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "network_error",
          reason: String(e)
        }),
        { status: 500, headers }
      );
    }

    let data;
    try {
      data = await aiRes.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "invalid_ai_response",
          reason: "AI response not JSON"
        }),
        { status: 500, headers }
      );
    }

    if (!aiRes.ok) {
      return new Response(
        JSON.stringify({
          error: "ai_error",
          status: aiRes.status,
          detail: data
        }),
        { status: 500, headers }
      );
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return new Response(
        JSON.stringify({
          error: "unable_to_solve",
          reason: "AI returned empty answer",
          raw: data
        }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ final: answer }),
      { headers }
    );
  }
};
