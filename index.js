export default {
  async fetch(req, env) {

    // ✅ CORS 필수
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Not allowed" }),
        { status: 405, headers: cors() }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: cors() }
      );
    }

    const question = body.question;
    if (!question) {
      return new Response(
        JSON.stringify({ error: "No question" }),
        { status: 400, headers: cors() }
      );
    }

    // 🔥 테스트용 하드코딩 (서버 살아있는지 확인)
    if (question.includes("1+1")) {
      return new Response(
        JSON.stringify({ final: "2" }),
        { headers: cors() }
      );
    }

    // 나머지는 임시 응답
    return new Response(
      JSON.stringify({ final: "Answer pending" }),
      { headers: cors() }
    );
  }
};

function cors() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };
}
