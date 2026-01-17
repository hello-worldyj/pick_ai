export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Not allowed", { status: 405 });
    }

    try {
      const { question, mode } = await request.json();

      if (!question || question.trim().length < 3) {
        return new Response(
          JSON.stringify({ final: "No valid question provided." }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const systemPrompt =
        mode === "explain"
          ? "You are a precise tutor. Explain briefly and give the final answer."
          : "You are a precise solver. Give ONLY the final answer. No explanation.";

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          temperature: 0
        })
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        return new Response(
          JSON.stringify({
            final: "AI server error",
            detail: errText
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const aiData = await openaiRes.json();
      const aiText = aiData.choices?.[0]?.message?.content?.trim();

      if (!aiText) {
        return new Response(
          JSON.stringify({ final: "No answer generated." }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          final: aiText,
          mode
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (e) {
      return new Response(
        JSON.stringify({
          final: "Worker crashed",
          error: e.message
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
