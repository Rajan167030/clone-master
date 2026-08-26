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

// Speech-to-text for voice-note feedback — proxies to Groq's Whisper endpoint
// (OpenAI-compatible /audio/transcriptions), reusing the same GROQ_API_KEY as the chat feature.
export const transcribe = async (req, res) => {
  try {
    const { audioUrl } = req.body || {};
    if (!audioUrl || typeof audioUrl !== "string") {
      return res.status(400).json({ message: "Missing audioUrl" });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return res.status(500).json({ message: "Groq API not configured" });

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      return res.status(400).json({ message: "Could not fetch the uploaded voice note." });
    }
    const audioBlob = await audioRes.blob();

    const form = new FormData();
    form.append("file", audioBlob, "voice-note.webm");
    form.append("model", process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo");
    form.append("response_format", "json");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.error?.message || "Transcription failed",
      });
    }

    return res.json({ text: data?.text || "" });
  } catch (err) {
    console.error("Groq transcribe error:", err?.message || err);
    return res.status(500).json({ message: "Transcription failed" });
  }
};

export default { chat, transcribe };
