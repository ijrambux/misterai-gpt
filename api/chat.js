// ردود محلية جاهزة
const localReplies = [
  { q: ["سلام", "السلام", "سلام عليكم"], a: "وعليكم السلام ورحمة الله، كيف نعاونك؟" },
  { q: ["اسمك", "من انت"], a: "أنا مساعد MisterAI تحت أمرك." },
  { q: ["وقت", "ساعة"], a: "الوقت عندك في الهاتف يا عبقري." },
  { q: ["مرحبا", "اهلا"], a: "مرحبا بيك! وش راك تحتاج؟" }
];

// دالة تبحث في الردود المحلية
function checkLocalReply(text) {
  text = text.toLowerCase();

  for (let item of localReplies) {
    for (let keyword of item.q) {
      if (text.includes(keyword)) {
        return item.a;
      }
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt missing" });
    }

    // 1) البحث المحلي
    const local = checkLocalReply(prompt);
    if (local) {
      return res.status(200).json({ reply: local });
    }

    // 2) اذا ما لقا → نبعث لـ GROQ
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(500).json({
        error: "Groq Error",
        details: data
      });
    }

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
