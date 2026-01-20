export default {
  async fetch(req, env) {
    // CORS preflight
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
      if (req.method !== "POST") {
        return new Response("Not allowed", { status: 405 });
      }

      const body = await req.json();
      const question = (body.question || "").trim();

      let final = "답변을 생성하지 못했어요";

      // 🔴 테스트용 기본 로직 (AI 안 써도 무조건 동작)
      if (question === "1+1" || question === "1+1?") final = "2";
      else if (question.length > 0) final = "unable to solve";

      return new Response(JSON.stringify({ final }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: "server error" }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
