export default {
  async fetch(req, env) {

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    if (req.method !== "POST") {
      return json({ error: "Not allowed" }, 405);
    }

    const body = await req.json();

    // OCR MODE
    if (body.mode === "ocr") {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPEN_AI_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract the question and give ONLY the final answer." },
                  { type: "image_url", image_url: { url: body.image } }
                ]
              }
            ],
            temperature: 0
          })
        });

        const data = await res.json();
        return json({
          final: data.choices[0].message.content.trim()
        });
      } catch {
        return json({ error: "OCR failed" }, 500);
      }
    }

    // TEXT MODE
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPEN_AI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Give only the final answer." },
            { role: "user", content: body.question }
          ],
          temperature: 0
        })
      });

      const data = await res.json();
      return json({
        final: data.choices[0].message.content.trim()
      });
    } catch {
      return json({ error: "AI server error" }, 500);
    }
  }
};

function cors() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors()
  });
}
