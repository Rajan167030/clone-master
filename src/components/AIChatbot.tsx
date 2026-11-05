import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Loader2, Sparkles, X } from "lucide-react";

const FAQ = [
  { q: "How do I register for an event?", a: "Go to the Events page, select an event, and click 'Register Event'." },
  { q: "How do I connect with founders?", a: "Join our Community and attend our regular Bangalore meetups and pitch days." },
  { q: "How do I reset my password?", a: "Go to Login, click 'Forgot password?', and follow the instructions." },
  { q: "How do I contact support?", a: "Type your question here or email support@foundersconnect.com." },
];

const SUGGESTIONS = [
  "How do I register for an event?",
  "How do I connect with founders?",
  "How do I reset my password?",
  "What is the FALCON Club?",
];

type Message = { from: "bot" | "user"; text: string };

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! I'm your AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Rotate the placeholder hint while the bar is collapsed and empty
  useEffect(() => {
    if (open || input) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setHintIndex((i) => (i + 1) % SUGGESTIONS.length), 3200);
    return () => window.clearInterval(t);
  }, [open, input]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, loading]);

  // Escape closes; clicking outside closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  function getFallbackReply(userText: string) {
    const normalized = userText.toLowerCase();

    if (normalized.includes("event") || normalized.includes("register")) return FAQ[0].a;
    if (normalized.includes("connect") || normalized.includes("community") || normalized.includes("founder")) return FAQ[1].a;
    if (normalized.includes("password") || normalized.includes("reset")) return FAQ[2].a;
    if (normalized.includes("support") || normalized.includes("contact")) return FAQ[3].a;

    return "AI service unavailable. Try again later or contact info@foundersconnect.co.in";
  }

  async function send(text: string) {
    const userText = text.trim();
    if (!userText || loading) return;
    setOpen(true);
    setMessages((msgs) => [...msgs, { from: "user", text: userText }]);
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
      const reply = data?.reply || data?.message || null;

      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: reply ? (typeof reply === "string" ? reply : JSON.stringify(reply)) : getFallbackReply(userText) },
      ]);
    } catch {
      setMessages((msgs) => [...msgs, { from: "bot", text: getFallbackReply(userText) }]);
    } finally {
      setLoading(false);
    }
  }

  const hasConversation = messages.length > 1;

  return (
    <div
      ref={rootRef}
      className="fixed inset-x-4 bottom-4 z-[1000] mx-auto max-w-[28rem] sm:bottom-6"
    >
      <div
        className={`overflow-hidden border bg-white transition-[border-radius,box-shadow,border-color] duration-300 ease-out ${
          open
            ? "rounded-[1.5rem] border-violet-200 shadow-[0_28px_80px_-22px_rgba(109,40,217,0.35)]"
            : "rounded-full border-slate-200/80 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.28)] hover:shadow-[0_16px_40px_-12px_rgba(109,40,217,0.35)]"
        }`}
      >
        {/* Expandable area: header + messages */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!open}
        >
          <div className="min-h-0">
            <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">AI Assistant</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">
                      <Sparkles className="h-3 w-3" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Ask about events, community, or support.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[min(55dvh,26rem)] overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`mb-3 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.from === "user"
                        ? "rounded-br-md bg-violet-600 text-white"
                        : "rounded-bl-md bg-slate-100 text-slate-800"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mb-3 flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    Thinking...
                  </div>
                </div>
              )}

              {!hasConversation && !loading && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      tabIndex={open ? 0 : -1}
                      onClick={() => send(q)}
                      className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* The pill input — always visible; focusing it expands the assistant */}
        <form
          className={`relative flex items-center gap-2 ${open ? "border-t border-violet-100 p-2" : "p-1.5"}`}
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              aria-label="Ask the AI assistant"
              className="h-10 w-full rounded-full bg-transparent pl-4 pr-2 text-base text-slate-800 outline-none sm:text-sm"
            />
            {/* Animated placeholder */}
            {!input && (
              <span
                key={open ? "open" : hintIndex}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-4 right-2 flex items-center truncate text-base text-slate-400 motion-safe:animate-[fade-in_0.4s_ease-out] sm:text-sm"
              >
                <span className="truncate">{open ? "Ask me anything…" : SUGGESTIONS[hintIndex]}</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            aria-label="Send message"
            disabled={open && (loading || !input.trim())}
            onClick={(e) => {
              if (!open && !input.trim()) {
                e.preventDefault();
                setOpen(true);
                inputRef.current?.focus();
              }
            }}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
              input.trim()
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-slate-100 text-slate-400"
            } disabled:cursor-not-allowed`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
