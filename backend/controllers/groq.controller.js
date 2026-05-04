// Proxy endpoint to call Groq AI
export const chat = async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") return res.status(400).json({ message: "Missing message" });

    const groqUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
    const groqKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    if (!groqUrl || !groqKey) return res.status(500).json({ message: "Groq API not configured" });

    const payload = {
      model: groqModel,
      messages: [
        {
          role: "system",
          content:
            "You are Founders Connect assistant. Give concise, practical replies about events, memberships, networking, and startup support.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    };

    const response = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.error?.message || "Groq request failed",
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";

    return res.json({ reply });
  } catch (err) {
    console.error("Groq chat error:", err?.message || err);
    return res.status(500).json({ message: "Groq request failed" });
  }
};

export default { chat };
