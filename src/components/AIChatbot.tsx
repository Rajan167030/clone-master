import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

const FAQ = [
  { q: "How do I register for an event?", a: "Go to the Events page, select an event, and click 'Register Event'." },
  { q: "How do I upgrade my membership?", a: "Visit the Membership page and choose your preferred plan." },
  { q: "How do I reset my password?", a: "Go to Login, click 'Forgot password?', and follow the instructions." },
  { q: "How do I contact support?", a: "Type your question here or email support@foundersconnect.com." },
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(msgs => [...msgs, { from: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      const reply = data?.reply || (data?.message || null);

      if (reply) {
        setMessages(msgs => [...msgs, { from: "bot", text: typeof reply === "string" ? reply : JSON.stringify(reply) }]);
      } else {
        // Fallback to FAQ if API responds unexpectedly
        const found = FAQ.find(f => userText.toLowerCase().includes(f.q.toLowerCase().split(" ")[2]));
        setMessages(msgs => [...msgs, { from: "bot", text: found ? found.a : "Sorry, I couldn't find an answer. Please contact support@foundersconnect.com." }]);
      }
    } catch (err) {
      const found = FAQ.find(f => userText.toLowerCase().includes(f.q.toLowerCase().split(" ")[2]));
      setMessages(msgs => [...msgs, { from: "bot", text: found ? found.a : "AI service unavailable. Try again later or contact support@foundersconnect.com." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {!open && (
        <button
          aria-label="Open chatbot"
          className="rounded-full bg-primary p-3 shadow-lg hover:brightness-95 border border-border"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="text-foreground" />
        </button>
      )}
      {open && (
        <div className="w-80 bg-secondary/90 rounded-xl shadow-2xl border border-border flex flex-col backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-2 bg-primary rounded-t-xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-foreground" />
              <span className="text-foreground font-semibold">AI Chat</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-foreground opacity-90 hover:opacity-100">✕</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto" style={{ maxHeight: 320 }}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${m.from === "user" ? "bg-background text-foreground border border-border" : "bg-primary text-foreground"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div className="mt-2 text-xs text-muted-foreground">Tip: try asking about events or membership</div>
          </div>
          <div className="p-2 border-t border-border flex gap-2">
            <input
              className="flex-1 border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none"
              placeholder="Ask me about events, membership..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <button
              className="bg-primary rounded px-3 py-1 text-foreground hover:opacity-90 border border-border"
              onClick={handleSend}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
