export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return json({ error: "Invalid request" }, 400);
    }

    const { question, image } = await req.json();

    const result = await pickAI({
      question,
      image,
      apiKey: env.OPEN_AI_KEY
    });

    return json(result);
  }
};

// --------------------
// Pick AI 로직
// --------------------
async function pickAI({ question, image, apiKey }) {
  const answers = {};
  const MAX_TRIES = 8;

  for (let i = 0; i < MAX_TRIES; i++) {
    const raw = await callOpenAI({
      question,
      image,
      apiKey
    });

    const answer = normalize(raw);

    answers[answer] = (answers[answer] || 0) + 1;

    // 같은 답 2번 나오면 즉시 확정
    if (answers[answer] >= 2) {
      return {
        final: answer,
        tries: i + 1,
        mode: "pick"
      };
    }
  }

  // 끝까지 합의 안 되면 최다 득표
  const sorted = Object.entries(answers)
    .sort((a, b) => b[1] - a[1]);

  return {
    final: sorted[0][0],
    tries: MAX_TRIES,
    mode: "pick",
    note: "low confidence"
  };
}

// --------------------
// OpenAI 호출
// --------------------
async function callOpenAI({ question, image, apiKey }) {
  const input = image
    ? [
        { type: "input_text", text: question },
        { type: "input_image", image_base64: image }
      ]
    : question;

  const res = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        input
      })
    }
  );

  const data = await res.json();
  return data.output_text;
}

// --------------------
// 정답 정리
// --------------------
function normalize(text) {
  return text
    .toString()
    .trim()
    .replace(/정답[:：]?\s*/i, "")
    .replace(/\.$/, "");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
