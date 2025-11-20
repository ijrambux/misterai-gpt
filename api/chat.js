export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message } = req.body;

  try {
    const reply = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد ذكي تابع لمنصة MisterAI." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await reply.json();

    if (!reply.ok) {
      console.error("OpenAI Error:", data);
      return res.status(500).json({ error: "خطأ من خادم الذكاء الاصطناعي." });
    }

    res.status(200).json({
      reply: data.choices[0].message.content,
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "خطأ داخلي في السيرفر." });
  }
}
