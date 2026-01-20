export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
      });
    }

    try {
      const body = await req.json();
      const question = body.question || body.text || "";

      if (!question.trim()) {
        return json({ error: "No question provided" });
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Solve the problem and give only the final answer." },
            { role: "user", content: question }
          ],
          temperature: 0
        })
      });

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content;

      return json({ final: answer || "Unable to solve" });
    } catch (e) {
      return json({ error: e.message });
    }
  }
};

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
