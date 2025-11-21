export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await groqRes.json();

    // لو كاين Error من Groq
    if (!groqRes.ok) {
      return res.status(500).json({
        error: "Groq Error",
        details: data
      });
    }

    // الرد الحقيقي
    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || "⚠️ Model returned empty response."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server crashed",
      details: error.message
    });
  }
}
