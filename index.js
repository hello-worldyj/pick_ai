export default {
  async fetch(request, env) {
    // POST만 허용
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const question = (data.question || "").trim();

    if (!question) {
      return new Response(
        JSON.stringify({ ok: false, error: "Empty question" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    /*
      ===============================
      🔧 테스트용 로직 (AI 없이)
      ===============================
      extension 정상 동작 확인용
    */
    if (question.includes("1+1")) {
      return new Response(
        JSON.stringify({ ok: true, final: "2" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (question.includes("2+2")) {
      return new Response(
        JSON.stringify({ ok: true, final: "4" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    /*
      ===============================
      기본 fallback (절대 undefined 안 보냄)
      ===============================
    */
    return new Response(
      JSON.stringify({
        ok: true,
        final: "Unknown"
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
