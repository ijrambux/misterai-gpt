import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt missing" });
    }

    // 1) تحميل ملف الردود
    const filePath = path.join(process.cwd(), "responses.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const { responses } = JSON.parse(fileData);

    // 2) البحث في الردود المحلية
    const lower = prompt.toLowerCase();
    for (let item of responses) {
      for (let keyword of item.keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          return res.status(200).json({ reply: item.reply });
        }
      }
    }

    // 3) إذا لم يجد → يرسل إلى GROQ
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
      return res.status(500).json({ error: "Groq Error", details: data });
    }

    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || "⚠️ النموذج ما رجّع والو."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server crashed",
      details: error.message
    });
  }
}
