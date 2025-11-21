import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import gTTS from "gtts";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    // 1. استدعاء Groq
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(500).json({ error: "Groq error", details: data });
    }

    const reply = data?.choices?.[0]?.message?.content || "لم أتمكن من توليد رد.";

    // 2. تحويل الرد إلى MP3 صوتي
    const fileName = uuidv4() + ".mp3";
    const filePath = path.join("/tmp", fileName);

    const tts = new gTTS(reply, "ar");
    await new Promise(resolve => tts.save(filePath, resolve));

    // 3. قراءة الملف الصوتي وإرساله Base64 إلى الواجهة
    const audioData = fs.readFileSync(filePath, { encoding: "base64" });

    return res.status(200).json({
      reply,
      audio: audioData
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
