// /api/chat.js

import Groq from "groq-sdk";
import { ElevenLabsClient } from "elevenlabs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // 1) GROQ – النص
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const groqResponse = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: message }]
    });

    const reply = groqResponse.choices[0].message.content;


    // 2) ELEVENLABS – الصوت الحقيقي
    const eleven = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    const tts = await eleven.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",   // voice_id الصحيح
      {
        text: reply,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128"
      }
    );

    const buffer = Buffer.from(await tts.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    // الرد النهائي
    res.status(200).json({
      reply,
      audioBase64
    });

  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
