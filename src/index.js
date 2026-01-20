export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return cors();
    }

    try {
      const body = await req.json();

      if (body.type !== "image") {
        return json({ final: "No answer" });
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPEN_AI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Solve all math problems in this image. Return only answers." },
                { type: "image_url", image_url: { url: body.imageBase64 } }
              ]
            }
          ],
          temperature: 0
        })
      });

      const data = await res.json();
      const answer =
        data?.choices?.[0]?.message?.content?.trim() || "No answer";

      return json({ final: answer });
    } catch {
      return json({ final: "No answer" });
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

function cors() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
