export default {
  async fetch(req) {
    /* ===== CORS ===== */
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    try {
      const body = await req.json();

      let result = "답변을 생성하지 못했어요";

      if (body.type === "text") {
        result = await solveText(body.question);
      }

      return new Response(
        JSON.stringify({ final: result }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (e) {
      return new Response(
        JSON.stringify({ error: "AI server error" }),
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};

/* ===== 예시 ===== */
async function solveText(q) {
  if (!q) return "No answer";
  if (q.includes("1+1")) return "2";
  return "답변을 생성하지 못했어요";
}
