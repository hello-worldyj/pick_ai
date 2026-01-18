export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Not allowed" }),
        { status: 403 }
      );
    }

    const body = await req.json();
    const question = body.question;

    if (!question) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 400 }
      );
    }

    if (question.includes("1+1")) {
      return new Response(
        JSON.stringify({ final: "2" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ final: "Unknown" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
