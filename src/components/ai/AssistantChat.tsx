import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendAssistantMessageApi, type AssistantMessage, type AssistantThread } from "@/lib/api";
import { getToken } from "@/lib/session";

/** Minimal, safe formatter: **bold**, bullet/numbered lines, and internal /learn/... links. No raw HTML. */
const inline = (text: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|\/learn\/[a-z0-9-]+)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\/learn\/[a-z0-9-]+$/.test(part)) {
      return (
        <Link key={i} to={part} className="font-medium text-violet-700 underline underline-offset-2">
          {part}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });

export const FormattedReply = ({ text }: { text: string }) => {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((b, bi) => {
        const lines = b.split("\n").filter((l) => l.trim());
        const bullets = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (bullets && lines.length) {
          const ordered = /^\s*\d/.test(lines[0]);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={bi} className={`${ordered ? "list-decimal" : "list-disc"} space-y-1 pl-5`}>
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>)}
            </Tag>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-line">
            {inline(lines.join("\n").replace(/^#+\s*/gm, ""))}
          </p>
        );
      })}
    </div>
  );
};

type Props = {
  thread: AssistantThread | null;
  onThread: (t: AssistantThread) => void;
  courseSlug?: string;
  lessonId?: string;
  suggestions?: string[];
  compact?: boolean;
};

const AssistantChat = ({ thread, onThread, courseSlug, lessonId, suggestions = [], compact }: Props) => {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<AssistantMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const messages = [...(thread?.messages || []), ...(pending ? [pending] : [])];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    setDraft("");
    setError("");
    setPending({ role: "user", content });
    setSending(true);
    try {
      const res = await sendAssistantMessageApi(getToken() || "", {
        content,
        threadId: thread?._id,
        courseSlug: thread ? undefined : courseSlug,
        lessonId: thread ? undefined : lessonId,
      });
      onThread(res.thread);
    } catch (e) {
      setError((e as Error).message);
      setDraft(content);
    } finally {
      setPending(null);
      setSending(false);
    }
  };

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "h-[calc(100vh-14rem)] min-h-[480px]"}`}>
      <div className="flex-1 space-y-4 overflow-y-auto px-1 pb-4">
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <Bot size={24} />
            </div>
            <p className="font-semibold text-slate-900">Ask anything about building a startup</p>
            <p className="mt-1 text-sm text-slate-500">Concepts from your courses, fundraising terms, metrics, GTM and more.</p>
            {suggestions.length > 0 && (
              <div className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-violet-300 hover:text-violet-700">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-800"
              }`}
            >
              {m.role === "assistant" ? <FormattedReply text={m.content} /> : <p className="whitespace-pre-line">{m.content}</p>}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </div>
        )}
        <div ref={bottom} />
      </div>
      {error && <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-end gap-2 border-t border-slate-200 pt-3"
      >
        <Textarea
          rows={2}
          value={draft}
          placeholder="Ask a question…"
          className="min-h-[44px] resize-none"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
        />
        <Button type="submit" disabled={sending || !draft.trim()} className="h-11 bg-violet-600 hover:bg-violet-700" aria-label="Send">
          <SendHorizontal size={16} />
        </Button>
      </form>
      <p className="mt-1.5 text-[11px] text-slate-400">AI can make mistakes. Not legal, tax or investment advice.</p>
    </div>
  );
};

export default AssistantChat;
