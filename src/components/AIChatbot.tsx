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
          className="group relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-purple-200/50 bg-[linear-gradient(135deg,#9333ea,#7e22ce)] text-white shadow-[0_18px_40px_-14px_rgba(147,51,234,0.7)] transition-transform duration-300 hover:-translate-y-1 hover:brightness-110 sm:h-12 sm:w-12"
          onClick={() => setOpen(true)}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)]" />
          <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
          <MessageCircle className="relative z-10 h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </button>
      )}
      {open && (
        <div className="relative w-[min(92vw,24rem)] overflow-hidden rounded-[1.5rem] border border-purple-200/60 bg-white/95 shadow-[0_28px_80px_-22px_rgba(147,51,234,0.25)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,51,234,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.05),transparent_45%)]" />
          <div className="relative flex items-center justify-between border-b border-purple-100/80 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-purple-100 bg-purple-50 text-purple-600 shadow-inner">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wide text-slate-800">AI Assistant</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-600">
                    <Sparkles className="h-3 w-3" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500">Ask about events, membership, or support.</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-100 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative max-h-[24rem] overflow-y-auto px-4 py-4">
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50/50 px-3 py-2 text-xs text-purple-700">
              <Mic className="h-4 w-4 text-purple-500" />
              Type a question or tap a quick prompt.
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.from === "user"
                      ? "bg-purple-600 text-white"
                      : "border border-purple-100 bg-purple-50/30 text-slate-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50/30 px-4 py-3 text-sm text-purple-600">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
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
                  className="rounded-2xl border border-purple-100 bg-white px-3 py-2 text-left text-xs text-purple-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                >
                  {question}
                </button>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
          <div className="relative border-t border-purple-100/80 p-3 bg-slate-50/30">
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-purple-200/60 bg-white px-4 py-3 pr-12 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-purple-400"
                placeholder="Ask me about events, membership..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-xl bg-purple-600 text-white shadow-[0_8px_20px_-8px_rgba(147,51,234,0.6)] transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSend}
                aria-label="Send message"
                disabled={loading || !input.trim()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
