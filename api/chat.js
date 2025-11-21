export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

    const data = await response.json();

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || "❌ no reply from model"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error: " + error.message
    });
  }
}

