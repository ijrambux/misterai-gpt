export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد ذكي تابع لمنصة MisterAI." },
          { role: "user", content: message }
        ]
      })
    }).then(r => r.json());

    res.status(200).json({ reply: completion.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ reply: "⚠ خطأ في الخادم." });
  }
}

