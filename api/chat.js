export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const reply = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد ذكي خاص بمنصة MisterAI." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await reply.json();

    // استخراج النص من الـ API الجديد
    const botReply =
      data.output_text ||
      data.choices?.[0]?.message?.content ||
      "..."

    res.status(200).json({ reply: botReply });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "⚠️ خطأ في الخادم." });
  }
}
