export default async function handler(req, res) {
  const { message } = req.body;

  const reply = await fetch("https://api.openai.com/v1/chat/completions", {
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

  res.status(200).json({
    reply: reply.choices[0].message.content
  });
}
