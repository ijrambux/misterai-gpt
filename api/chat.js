// /api/chat.js

import Groq from "groq-sdk";
import { ElevenLabsClient } from "elevenlabs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // --- النص من GROQ ---
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: message }]
    });

    const reply = completion.choices[0].message.content;


    // --- الصوت الحقيقي من ElevenLabs ---
    const eleven = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const audioResponse = await eleven.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",   // صوت عربي
      {
        text: reply,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128"
      }
    );

    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    res.status(200).json({
      reply,
      audioBase64
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
