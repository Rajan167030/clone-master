import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Mic, Sparkles, Send, X } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const suggestions = [
    "How do I register for an event?",
    "How do I upgrade my membership?",
    "How do I reset my password?",
  ];

  function getFallbackReply(userText: string) {
    const normalized = userText.toLowerCase();

    if (normalized.includes("event") || normalized.includes("register")) return FAQ[0].a;
    if (normalized.includes("membership") || normalized.includes("plan")) return FAQ[1].a;
    if (normalized.includes("password") || normalized.includes("reset")) return FAQ[2].a;
    if (normalized.includes("support") || normalized.includes("contact")) return FAQ[3].a;

    return "AI service unavailable. Try again later or contact info@foundersconnect.co.in";
  }

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
        setMessages(msgs => [...msgs, { from: "bot", text: getFallbackReply(userText) }]);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { from: "bot", text: getFallbackReply(userText) }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(question: string) {
    setInput(question);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1000] sm:bottom-6 sm:right-6">
      {!open && (
        <button
          aria-label="Open chatbot"
          className="group relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-violet-300/40 bg-[linear-gradient(135deg,hsl(264_84%_46%),hsl(280_80%_38%))] text-white shadow-[0_18px_40px_-14px_rgba(124,58,237,0.85)] transition-transform duration-300 hover:-translate-y-1 hover:brightness-110 sm:h-12 sm:w-12"
          onClick={() => setOpen(true)}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_60%)]" />
          <span className="absolute inset-0 rounded-full ring-1 ring-white/15" />
          <MessageCircle className="relative z-10 h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </button>
      )}
      {open && (
        <div className="relative w-[min(92vw,24rem)] overflow-hidden rounded-[1.5rem] border border-white/20 bg-slate-950/45 shadow-[0_28px_80px_-22px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_42%)]" />
          <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner shadow-white/10">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wide text-white">AI Chat</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-100">
                    <Sparkles className="h-3 w-3" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-white/65">Ask about events, membership, or support.</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative max-h-[24rem] overflow-y-auto px-4 py-4">
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/70">
              <Mic className="h-4 w-4 text-cyan-200" />
              Type a question or tap a quick prompt.
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                    m.from === "user"
                      ? "border border-white/15 bg-white/15 text-white backdrop-blur-sm"
                      : "border border-cyan-300/15 bg-slate-900/60 text-slate-100"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-cyan-300/15 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />
                  Thinking...
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-2">
              {suggestions.map(question => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestionClick(question)}
                  className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-left text-xs text-white/75 transition hover:border-cyan-300/25 hover:bg-white/12 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
          <div className="relative border-t border-white/10 p-3">
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none ring-0 transition focus:border-cyan-300/30 focus:bg-white/14"
              placeholder="Ask me about events, membership..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <button
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/25 bg-[linear-gradient(135deg,hsl(264_84%_46%),hsl(280_80%_38%))] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(124,58,237,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSend}
              aria-label="Send"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              Send message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
